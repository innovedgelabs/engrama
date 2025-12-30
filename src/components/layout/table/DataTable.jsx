import { memo, useMemo, useState, useCallback, useEffect } from 'react';
import {
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Box,
  Typography,
  TableSortLabel,
} from '@mui/material';

const SCROLLBAR_STYLES = {
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    backgroundColor: 'transparent',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: 'rgba(62, 207, 160, 0.7)',
    borderRadius: '4px',
    '&:hover': {
      backgroundColor: 'rgba(62, 207, 160, 0.9)',
    },
  },
};

const DEFAULT_EMPTY_STATE = {
  title: 'No hay registros disponibles',
  description: 'Consulta filtros o criterios de busqueda.',
};

const normalizeValue = (value) => {
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'number') {
    return value;
  }

  if (value instanceof Date) {
    return value.getTime();
  }

  return String(value).toLowerCase();
};

const DataTable = ({
  columns,
  rows,
  getRowId = (row) => row.id,
  size = 'small',
  stickyHeader = true,
  minWidth = 650,
  emptyState = DEFAULT_EMPTY_STATE,
  containerSx,
  tableSx,
  headerSx,
  bodySx,
  defaultSort,
  sortState,
  onSortChange,
}) => {
  const hasRows = Array.isArray(rows) && rows.length > 0;

  if (!hasRows) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          {emptyState.title}
        </Typography>
        {emptyState.description && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            {emptyState.description}
          </Typography>
        )}
      </Box>
    );
  }

  const isControlled = Boolean(sortState && onSortChange);
  const [internalSort, setInternalSort] = useState(() => ({
    orderBy: defaultSort?.orderBy ?? null,
    order: defaultSort?.order ?? 'asc',
  }));

  const activeSort = isControlled ? sortState : internalSort;

  useEffect(() => {
    if (isControlled || !defaultSort) {
      return;
    }

    setInternalSort({
      orderBy: defaultSort.orderBy ?? null,
      order: defaultSort.order ?? 'asc',
    });
  }, [defaultSort, isControlled]);

  useEffect(() => {
    if (!activeSort.orderBy) {
      return;
    }

    const columnExists = columns.some(
      (column) => column.key === activeSort.orderBy && column.sortable
    );

    if (columnExists) {
      return;
    }

    const resetSort = { orderBy: null, order: 'asc' };

    if (isControlled) {
      onSortChange(resetSort);
    } else {
      setInternalSort(resetSort);
    }
  }, [columns, activeSort, isControlled, onSortChange]);

  const handleRequestSort = useCallback(
    (columnKey) => {
      const column = columns.find((col) => col.key === columnKey);
      if (!column || !column.sortable) {
        return;
      }

      const isAsc = activeSort.orderBy === columnKey && activeSort.order === 'asc';
      const nextSort = {
        orderBy: columnKey,
        order: isAsc ? 'desc' : 'asc',
      };

      if (isControlled) {
        onSortChange(nextSort);
      } else {
        setInternalSort(nextSort);
      }
    },
    [columns, activeSort, isControlled, onSortChange]
  );

  const sortedRows = useMemo(() => {
    if (!activeSort.orderBy) {
      return rows;
    }

    const sortColumn = columns.find(
      (column) => column.key === activeSort.orderBy && column.sortable
    );

    if (!sortColumn) {
      return rows;
    }

    const accessor =
      sortColumn.sortAccessor ??
      ((row) => {
        if (sortColumn.sortField) {
          return row[sortColumn.sortField];
        }
        return row[sortColumn.key];
      });

    const comparator =
      sortColumn.sortComparator ??
      ((a, b, order) => {
        const aValue = normalizeValue(accessor(a));
        const bValue = normalizeValue(accessor(b));

        if (aValue < bValue) {
          return order === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return order === 'asc' ? 1 : -1;
        }
        return 0;
      });

    return [...rows].sort((a, b) => comparator(a, b, activeSort.order));
  }, [rows, columns, activeSort]);

  const renderHeaderLabel = useCallback(
    (column) => {
      const labelContent = typeof column.label === 'function' ? column.label() : column.label;

      if (!column.sortable) {
        return labelContent;
      }

      return (
        <TableSortLabel
          active={activeSort.orderBy === column.key}
          direction={activeSort.orderBy === column.key ? activeSort.order : 'asc'}
          onClick={() => handleRequestSort(column.key)}
          sx={{ fontSize: '0.8125rem', fontWeight: 600, ...column.sortLabelSx }}
        >
          {labelContent}
        </TableSortLabel>
      );
    },
    [activeSort, handleRequestSort]
  );

  return (
    <TableContainer
      sx={{
        flex: 1,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflowX: 'auto',
        overflowY: 'hidden',
        ...containerSx,
      }}
    >
      <Table
        size={size}
        stickyHeader={stickyHeader}
        sx={{
          minWidth,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          '& .MuiTableHead-root': {
            display: 'table',
            width: '100%',
            tableLayout: 'fixed',
            position: 'sticky',
            top: 0,
            zIndex: 1,
          },
          '& .MuiTableHead-root .MuiTableRow-root': {
            display: 'table',
            width: '100%',
            tableLayout: 'fixed',
          },
          '& .MuiTableBody-root .MuiTableRow-root': {
            display: 'table',
            width: '100%',
            tableLayout: 'fixed',
          },
          ...tableSx,
        }}
      >
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell
                key={column.key}
                align={column.align ?? 'left'}
                sx={{
                  fontWeight: 600,
                  fontSize: '0.8125rem',
                  bgcolor: 'background.paper',
                  borderBottom: '2px solid',
                  borderColor: 'divider',
                  ...headerSx,
                  ...column.headerSx,
                }}
              >
                {renderHeaderLabel(column)}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody
          sx={{
            display: 'block',
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            ...SCROLLBAR_STYLES,
            ...bodySx,
          }}
        >
          {sortedRows.map((row, rowIndex) => (
            <TableRow
              hover
              key={getRowId(row) ?? rowIndex}
              sx={{
                ...(row.onClick ? { cursor: 'pointer' } : {}),
                ...row.rowSx,
              }}
              onClick={row.onClick}
            >
              {columns.map((column) => (
                <TableCell key={column.key} align={column.align ?? 'left'} sx={column.cellSx}>
                  {column.render ? column.render(row, rowIndex) : row[column.key]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default memo(DataTable);
