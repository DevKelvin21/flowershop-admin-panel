import * as React from "react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  type PaginationState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export interface PaginationConfig {
  pageIndex: number
  pageSize: number
  pageCount: number
  total: number
  onPageChange: (pageIndex: number) => void
  onPageSizeChange: (pageSize: number) => void
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchKey?: string
  searchValue?: string
  emptyMessage?: string
  // Server-side pagination
  pagination?: PaginationConfig
  // Client-side pagination (used when pagination prop is not provided)
  defaultPageSize?: number
  // Row click handler
  onRowClick?: (row: TData) => void
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchValue,
  emptyMessage = "No hay datos para mostrar",
  pagination,
  defaultPageSize = 10,
  onRowClick,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  // Client-side pagination state (only used when server-side pagination is not provided)
  const [clientPagination, setClientPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: defaultPageSize,
  })

  const isServerSide = !!pagination

  // Sync external search with column filter
  React.useEffect(() => {
    if (searchKey && searchValue !== undefined) {
      setColumnFilters((prev) => {
        const existingFilter = prev.find((f) => f.id === searchKey)
        if (existingFilter) {
          return prev.map((f) => (f.id === searchKey ? { ...f, value: searchValue } : f))
        }
        return [...prev, { id: searchKey, value: searchValue }]
      })
    }
  }, [searchKey, searchValue])

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    // Conditional pagination setup
    ...(isServerSide
      ? {
          manualPagination: true,
          pageCount: pagination.pageCount,
        }
      : {
          getPaginationRowModel: getPaginationRowModel(),
          getFilteredRowModel: getFilteredRowModel(),
        }),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: isServerSide
        ? { pageIndex: pagination.pageIndex, pageSize: pagination.pageSize }
        : clientPagination,
    },
    onPaginationChange: isServerSide
      ? (updater) => {
          const newState =
            typeof updater === "function"
              ? updater({ pageIndex: pagination.pageIndex, pageSize: pagination.pageSize })
              : updater
          if (newState.pageIndex !== pagination.pageIndex) {
            pagination.onPageChange(newState.pageIndex)
          }
          if (newState.pageSize !== pagination.pageSize) {
            pagination.onPageSizeChange(newState.pageSize)
          }
        }
      : setClientPagination,
  })

  const currentPageIndex = isServerSide ? pagination.pageIndex : clientPagination.pageIndex
  const currentPageSize = isServerSide ? pagination.pageSize : clientPagination.pageSize
  const totalRows = isServerSide ? pagination.total : table.getFilteredRowModel().rows.length
  const pageCount = isServerSide ? pagination.pageCount : table.getPageCount()

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() => onRowClick?.(row.original)}
                  className={onRowClick ? "cursor-pointer" : undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <div className="flex-1 text-sm text-muted-foreground">
          {totalRows} registro(s)
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Filas por página</p>
            <Select
              value={`${currentPageSize}`}
              onValueChange={(value) => {
                const newSize = Number(value)
                if (isServerSide) {
                  pagination.onPageSizeChange(newSize)
                } else {
                  table.setPageSize(newSize)
                }
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={currentPageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((size) => (
                  <SelectItem key={size} value={`${size}`}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Página {currentPageIndex + 1} de {pageCount || 1}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Primera página</span>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Página anterior</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Siguiente página</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(pageCount - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Última página</span>
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
