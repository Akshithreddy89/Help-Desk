const resend = require("../config/resend");

const sendAgentInvitation = async (email, firstName, invitationLink) => {
  try {
    const response = await resend.emails.send({
      from: process.env.EMAIL_FROM,

      to: email,

      subject: "Welcome to HelpDesk",

      html: `
                <div style="font-family:Arial;padding:20px">

                    <h2>Hello ${firstName},</h2>

                    <p>
                        You have been added as an Agent in the HelpDesk System.
                    </p>

                    <p>
                        Click the button below to create your password.
                    </p>

                    <a
                        href="${invitationLink}"
                        style="
                            background:#2563eb;
                            color:white;
                            padding:12px 20px;
                            text-decoration:none;
                            border-radius:6px;
                            display:inline-block;
                        "
                    >
                        Create Password
                    </a>

                    <br><br>

                    <p>
                        This link expires in 30 minutes.
                    </p>

                    <p>
                        Thank you,
                        <br>
                        HelpDesk Team
                    </p>

                </div>
            `,
    });

    return response;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  sendAgentInvitation,
};
