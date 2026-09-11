const { v4: uuidv4 } = require("uuid");
const { Op } = require("sequelize");
const {
  sequelize,
  AvailabilitySlot,
  BookingSession,
} = require("../../../models");
const { validateHoldSlotRequest } = require("../validators/holdSlot.validator");

const HOLD_DURATION_MINUTES = 5;

const releaseExpiredHolds = async () => {
  const now = new Date();
  const transaction = await sequelize.transaction();

  try {
    const expiredSlots = await AvailabilitySlot.findAll({
      where: {
        status: "Held",
        held_until: {
          [Op.lte]: now,
        },
      },
      attributes: ["id"],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (expiredSlots.length === 0) {
      await transaction.commit();
      return 0;
    }

    const slotIds = expiredSlots.map((slot) => slot.id);

    await AvailabilitySlot.update(
      {
        status: "Available",
        held_until: null,
      },
      {
        where: {
          id: {
            [Op.in]: slotIds,
          },
        },
        transaction,
      },
    );

    await BookingSession.update(
      { status: "Expired" },
      {
        where: {
          slot_id: {
            [Op.in]: slotIds,
          },
          status: "Active",
          held_until: {
            [Op.lte]: now,
          },
        },
        transaction,
      },
    );

    await transaction.commit();
    return slotIds.length;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const holdSlot = async (publicToken, slotId) => {
  const transaction = await sequelize.transaction();

  try {
    const { slot } = await validateHoldSlotRequest(publicToken, slotId, transaction);

    const heldUntil = new Date(Date.now() + HOLD_DURATION_MINUTES * 60 * 1000);

    const bookingSession = await BookingSession.create(
      {
        slot_id: slot.id,
        session_token: uuidv4(),
        status: "Active",
        held_until: heldUntil,
      },
      { transaction },
    );

    slot.status = "Held";
    slot.held_until = heldUntil;
    await slot.save({ transaction });

    await transaction.commit();

    return {
      session: {
        id: bookingSession.id,
        session_token: bookingSession.session_token,
        status: bookingSession.status,
        held_until: bookingSession.held_until,
      },
      slot: {
        id: slot.id,
        availability_id: slot.availability_id,
        start_datetime: slot.start_datetime,
        end_datetime: slot.end_datetime,
        status: slot.status,
        held_until: slot.held_until,
      },
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

module.exports = { holdSlot, releaseExpiredHolds };
