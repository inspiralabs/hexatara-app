'use client';

import {
  columnFilteringFeature,
  createColumnHelper,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_includesString,
  rowPaginationFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  tableFeatures,
  useTable,
  type Column,
  type ColumnDef,
  type RowData,
} from '@tanstack/react-table';
import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Satu instance fitur dipakai semua DataTable di Admin — TanStack Table v9
// mendaftarkan fitur secara eksplisit per tabel (bukan otomatis semua seperti
// v8), jadi cukup satu deklarasi dipakai ulang lewat createDataTableColumnHelper.
export const dataTableFeatures = tableFeatures({
  columnFilteringFeature,
  rowSortingFeature,
  rowPaginationFeature,
  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  filterFns: { includesString: filterFn_includesString },
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

const PAGE_SIZE_OPTIONS = [10, 20, 30, 50, 100];

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
      className="flex items-center gap-1 text-left font-medium hover:text-warna-teks"
    >
      {label}
      {sorted === 'asc' ? (
        <ArrowUpIcon className="size-3.5" />
      ) : sorted === 'desc' ? (
        <ArrowDownIcon className="size-3.5" />
      ) : (
        <ArrowUpDownIcon className="size-3.5 text-warna-teks-2/40" />
      )}
    </button>
  );
}

// Windowed page numbers: semua halaman kalau <=7, kalau lebih tampilkan
// pertama/terakhir + tetangga halaman aktif + "…". Cukup untuk daftar admin
// yang bisa membengkak (sertifikat setelah import massal), tanpa membangun
// komponen pagination generik yang tidak diminta.
function pageNumbers(current: number, count: number): (number | 'ellipsis')[] {
  if (count <= 7) return Array.from({ length: count }, (_, i) => i);
  const result = new Set([0, count - 1, current - 1, current, current + 1]);
  const sorted = [...result].filter((p) => p >= 0 && p < count).sort((a, b) => a - b);
  const withEllipsis: (number | 'ellipsis')[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1]! > 1) withEllipsis.push('ellipsis');
    withEllipsis.push(p);
  });
  return withEllipsis;
}

export function DataTable<TData extends RowData>({
  columns,
  data,
  searchColumnId,
  searchPlaceholder = 'Cari...',
  emptyMessage = 'Belum ada data.',
}: {
  columns: DataTableColumnDef<TData>[];
  data: TData[];
  searchColumnId?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
}) {
  const table = useTable({
    features: dataTableFeatures,
    columns,
    data,
    initialState: { pagination: { pageIndex: 0, pageSize: 10 } },
  });

  const searchColumn = searchColumnId ? table.getColumn(searchColumnId) : undefined;
  const rows = table.getRowModel().rows;
  const pageIndex = table.state.pagination.pageIndex;
  const pageCount = table.getPageCount();

  return (
    <div className="flex flex-col gap-3">
      {searchColumn && (
        <Input
          value={(searchColumn.getFilterValue() as string) ?? ''}
          onChange={(e) => searchColumn.setFilterValue(e.target.value)}
          placeholder={searchPlaceholder}
          className="h-11 max-w-sm"
        />
      )}

      <div className="overflow-x-auto rounded-lg border border-warna-latar-2">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : <table.FlexRender header={header} />}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center text-warna-teks-2">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id}>
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

      {rows.length > 0 && (
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <div className="flex items-center gap-2 text-sm text-warna-teks-2">
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

          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
              Sebelumnya
            </Button>
            {pageNumbers(pageIndex, pageCount).map((p, i) =>
              p === 'ellipsis' ? (
                <span key={`ellipsis-${i}`} className="px-1.5 text-sm text-warna-teks-2">
                  …
                </span>
              ) : (
                <button
                  key={p}
                  type="button"
                  onClick={() => table.setPageIndex(p)}
                  aria-current={p === pageIndex}
                  className={cn(
                    'flex size-9 items-center justify-center rounded-md text-sm',
                    p === pageIndex
                      ? 'bg-warna-utama text-warna-latar'
                      : 'text-warna-teks-2 hover:bg-warna-latar-2 hover:text-warna-teks'
                  )}
                >
                  {p + 1}
                </button>
              )
            )}
            <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
              Berikutnya
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
