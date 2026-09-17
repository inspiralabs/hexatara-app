'use client';

import { useMemo, type ReactNode } from 'react';
import {
  columnFilteringFeature,
  createColumnHelper,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_equalsString,
  filterFn_includesString,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  tableFeatures,
  useTable,
  type Column,
  type ColumnDef,
  type RowData,
} from '@tanstack/react-table';
import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Satu instance fitur dipakai semua DataTable di Admin — TanStack Table v9
// mendaftarkan fitur secara eksplisit per tabel (bukan otomatis semua seperti
// v8), jadi cukup satu deklarasi dipakai ulang lewat createDataTableColumnHelper.
export const dataTableFeatures = tableFeatures({
  columnFilteringFeature,
  rowSortingFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  filterFns: {
    includesString: filterFn_includesString,
    equalsString: filterFn_equalsString,
  },
  sortFns: { alphanumeric: sortFn_alphanumeric },
});

export function createDataTableColumnHelper<TData extends RowData>() {
  return createColumnHelper<typeof dataTableFeatures, TData>();
}

// `any` di sini persis pola resmi TanStack (ColumnDef<TData, any>[]) — array satu
// tabel berisi kolom dengan TValue berbeda-beda (string, enum, null, tanpa nilai
// untuk kolom display), dan varians `accessorFn` menolak `unknown` di posisi ini.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DataTableColumnDef<TData extends RowData> = ColumnDef<typeof dataTableFeatures, TData, any>;

export type DataTableColumnFilter = {
  id: string;
  label: string;
  options: { value: string; label: string }[];
  /** Nilai Select untuk "tampilkan semua" — jangan bentrok dengan value opsi nyata */
  allValue?: string;
};

const PAGE_SIZE_OPTIONS = [10, 20, 30, 50, 100];
const FILTER_ALL = '__all__';

export function SortableHeader<TData extends RowData, TValue>({
  column,
  label,
}: {
  column: Column<typeof dataTableFeatures, TData, TValue>;
  label: string;
}) {
  if (!column.getCanSort()) return <>{label}</>;

  const sorted = column.getIsSorted();
  return (
    <button
      type="button"
      onClick={column.getToggleSortingHandler()}
      className="flex items-center gap-1 text-left font-medium hover:text-foreground"
    >
      {label}
      {sorted === 'asc' ? (
        <ArrowUpIcon className="size-3.5" />
      ) : sorted === 'desc' ? (
        <ArrowDownIcon className="size-3.5" />
      ) : (
        <ArrowUpDownIcon className="size-3.5 text-muted-foreground/50" />
      )}
    </button>
  );
}

export function DataTable<TData extends RowData>({
  columns,
  data,
  searchColumnId,
  searchPlaceholder = 'Cari...',
  emptyMessage = 'Belum ada data.',
  columnFilters,
  enableRowSelection = true,
  getRowId,
  toolbarStart,
  toolbarEnd,
}: {
  columns: DataTableColumnDef<TData>[];
  data: TData[];
  searchColumnId?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  columnFilters?: DataTableColumnFilter[];
  enableRowSelection?: boolean;
  getRowId?: (originalRow: TData, index: number) => string;
  toolbarStart?: ReactNode;
  toolbarEnd?: ReactNode;
}) {
  const columnsWithSelect = useMemo(() => {
    if (!enableRowSelection) return columns;
    const selectCol = createDataTableColumnHelper<TData>().display({
      id: '_select',
      header: ({ table: t }) => (
        <Checkbox
          aria-label="Pilih semua baris di halaman ini"
          checked={t.getIsAllPageRowsSelected()}
          indeterminate={t.getIsSomePageRowsSelected() && !t.getIsAllPageRowsSelected()}
          onCheckedChange={(v) => t.toggleAllPageRowsSelected(v === true)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          aria-label="Pilih baris"
          checked={row.getIsSelected()}
          disabled={!row.getCanSelect()}
          onCheckedChange={(v) => row.toggleSelected(v === true)}
        />
      ),
      enableSorting: false,
    });
    return [selectCol, ...columns];
  }, [columns, enableRowSelection]);

  const table = useTable({
    features: dataTableFeatures,
    columns: columnsWithSelect,
    data,
    getRowId,
    initialState: { pagination: { pageIndex: 0, pageSize: 10 } },
  });

  const searchColumn = searchColumnId ? table.getColumn(searchColumnId) : undefined;
  const rows = table.getRowModel().rows;
  const pageIndex = table.state.pagination.pageIndex;
  const pageCount = Math.max(table.getPageCount(), 1);
  const colSpan = columnsWithSelect.length;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        {toolbarStart}
        {searchColumn && (
          <Input
            value={(searchColumn.getFilterValue() as string) ?? ''}
            onChange={(e) => searchColumn.setFilterValue(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-11 w-full max-w-sm sm:w-56"
          />
        )}
        {(columnFilters ?? []).map((filter) => {
          const col = table.getColumn(filter.id);
          if (!col) return null;
          const allValue = filter.allValue ?? FILTER_ALL;
          const raw = col.getFilterValue();
          const current = typeof raw === 'string' && raw !== '' ? raw : allValue;
          return (
            <Select
              key={filter.id}
              value={current}
              onValueChange={(v: string | null) => {
                if (!v || v === allValue) col.setFilterValue(undefined);
                else col.setFilterValue(v);
              }}
            >
              <SelectTrigger className="h-11 w-full sm:w-44" aria-label={filter.label}>
                <SelectValue placeholder={filter.label}>
                  {current === allValue
                    ? `${filter.label}: Semua`
                    : (filter.options.find((o) => o.value === current)?.label ?? filter.label)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={allValue}>Semua</SelectItem>
                {filter.options.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        })}
        {toolbarEnd ? <div className="flex w-full sm:ml-auto sm:w-auto">{toolbarEnd}</div> : null}
      </div>

      {/* Scroll horizontal terbatas di kontainer — halaman shell tidak ikut geser (375px). */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <Table className="min-w-[40rem]">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className={header.id === '_select' ? 'w-10' : undefined}>
                    {header.isPlaceholder ? null : <table.FlexRender header={header} />}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={colSpan} className="text-center text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() ? 'selected' : undefined}>
                  {row.getAllCells().map((cell) => (
                    <TableCell key={cell.id}>
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {table.getFilteredRowModel().rows.length > 0 && (
        <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            Baris per halaman
            <Select
              items={PAGE_SIZE_OPTIONS.map((n) => ({ value: String(n), label: String(n) }))}
              value={String(table.state.pagination.pageSize)}
              onValueChange={(v: string | null) => v && table.setPageSize(Number(v))}
            >
              <SelectTrigger className="h-9 w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-1 sm:justify-end">
            <p className="mr-2 text-sm text-muted-foreground tabular-nums">
              Halaman {pageIndex + 1} dari {pageCount}
            </p>
            <Button
              variant="outline"
              size="icon"
              className="size-9"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              aria-label="Halaman pertama"
            >
              <ChevronsLeftIcon className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-9"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              aria-label="Halaman sebelumnya"
            >
              <ChevronLeftIcon className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-9"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              aria-label="Halaman berikutnya"
            >
              <ChevronRightIcon className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-9"
              onClick={() => table.setPageIndex(pageCount - 1)}
              disabled={!table.getCanNextPage()}
              aria-label="Halaman terakhir"
            >
              <ChevronsRightIcon className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
