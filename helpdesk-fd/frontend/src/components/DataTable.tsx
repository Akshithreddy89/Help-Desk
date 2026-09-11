import React from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, CircularProgress, Typography, Box, Pagination
} from '@mui/material';

export interface Column<T> {
  id: string; // Used as key
  label: string;
  align?: 'left' | 'center' | 'right';
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  minWidth?: number;
  // Pagination props
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  showPagination?: boolean;
}

export function DataTable<T extends { id: string | number }>({
  columns,
  data,
  loading = false,
  emptyMessage = "No data found.",
  minWidth = 650,
  page = 1,
  totalPages = 1,
  onPageChange,
  showPagination = true
}: DataTableProps<T>) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0, overflow: 'hidden' }}>
      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', flexGrow: 1, overflow: 'auto', minHeight: 0 }}>
      <Table stickyHeader sx={{ minWidth }}>
        <TableHead>
          <TableRow sx={{ '& th': { borderBottom: '1px solid #eee', color: 'text.secondary', fontWeight: 'bold', fontSize: '0.75rem', bgcolor: 'white' } }}>
            {columns.map(col => (
              <TableCell key={col.id} align={col.align || 'left'}>
                {col.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={columns.length} align="center" sx={{ py: 6 }}>
                <CircularProgress />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>Loading...</Typography>
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} align="center" sx={{ py: 6 }}>
                <Typography color="text.secondary">{emptyMessage}</Typography>
              </TableCell>
            </TableRow>
          ) : (
            data.map(row => (
              <TableRow key={row.id} hover sx={{ '& td': { borderBottom: '1px solid #f5f5f5', py: 1.5 }, '&:last-child td': { borderBottom: 0 } }}>
                {columns.map(col => (
                  <TableCell key={col.id} align={col.align || 'left'}>
                    {col.render ? col.render(row) : (row as any)[col.id]}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      </TableContainer>

      {/* Pagination Footer */}
      {!loading && showPagination && totalPages > 1 && onPageChange && (
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
          <Pagination 
            count={totalPages} 
            page={page} 
            onChange={(_, value) => onPageChange(value)} 
            color="primary" 
          />
        </Box>
      )}
    </Box>
  );
}

export default DataTable;
