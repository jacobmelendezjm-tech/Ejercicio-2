import { readFile } from "node:fs/promises"
import path from "node:path"
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShaderBackground } from "@/components/shader-background"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

const PAGE_SIZE = 25

type Vehiculo = {
  id: number
  marca: string
  modelo: string
  potencia_cv: number
  pais_fabricacion: string
}

async function getVehiculos(): Promise<Vehiculo[]> {
  const file = path.join(process.cwd(), "public", "json", "vehiculos_200.json")
  return JSON.parse(await readFile(file, "utf8"))
}

function buildHref(page: number, sort: "asc" | "desc" | null) {
  const query = new URLSearchParams({ page: String(page) })
  if (sort) query.set("sort", sort)
  return `?${query}`
}

const SORT_OPTIONS = [
  { value: "asc", label: "Ordenar de menor a mayor potencia", Icon: ChevronUpIcon },
  { value: "desc", label: "Ordenar de mayor a menor potencia", Icon: ChevronDownIcon },
] as const

function getPageList(current: number, total: number) {
  const pages: (number | "ellipsis-start" | "ellipsis-end")[] = []
  for (let page = 1; page <= total; page++) {
    if (page === 1 || page === total || Math.abs(page - current) <= 1) {
      pages.push(page)
    } else if (page < current && pages.at(-1) !== "ellipsis-start") {
      pages.push("ellipsis-start")
    } else if (page > current && pages.at(-1) !== "ellipsis-end") {
      pages.push("ellipsis-end")
    }
  }
  return pages
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const sort = params.sort === "asc" || params.sort === "desc" ? params.sort : null
  const vehiculos = await getVehiculos()
  if (sort) {
    vehiculos.sort((a, b) =>
      sort === "desc"
        ? b.potencia_cv - a.potencia_cv
        : a.potencia_cv - b.potencia_cv
    )
  }
  const totalPages = Math.max(1, Math.ceil(vehiculos.length / PAGE_SIZE))
  const requested = Number(params.page)
  const currentPage = Number.isInteger(requested)
    ? Math.min(Math.max(requested, 1), totalPages)
    : 1
  const pageItems = vehiculos.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  )

  return (
    <div className="relative w-full overflow-hidden bg-neutral-950">
      <ShaderBackground />
      <div className="relative mx-auto w-full max-w-[1200px]">
        <div className="grid min-h-svh grid-cols-12 items-start">
          <Card className="col-span-12">
            <CardHeader>
              <CardTitle>Vehículos</CardTitle>
              <CardDescription>
                {vehiculos.length} vehículos del archivo vehiculos_200.json. Página{" "}
                {currentPage} de {totalPages}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Marca</TableHead>
                    <TableHead>Modelo</TableHead>
                    <TableHead>País de fabricación</TableHead>
                    <TableHead>
                      <div className="flex items-center justify-end gap-1">
                        Potencia (CV)
                        <div className="flex flex-col">
                          {SORT_OPTIONS.map(({ value, label, Icon }) => {
                            const isActive = sort === value
                            return (
                              <Button
                                key={value}
                                variant={isActive ? "default" : "ghost"}
                                size="icon-xs"
                                className="h-4"
                                nativeButton={false}
                                render={
                                  <Link
                                    href={buildHref(1, isActive ? null : value)}
                                    aria-label={label}
                                    aria-pressed={isActive}
                                  />
                                }
                              >
                                <Icon />
                              </Button>
                            )
                          })}
                        </div>
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageItems.map((vehiculo) => (
                    <TableRow key={vehiculo.id}>
                      <TableCell className="font-medium">{vehiculo.id}</TableCell>
                      <TableCell>{vehiculo.marca}</TableCell>
                      <TableCell>{vehiculo.modelo}</TableCell>
                      <TableCell>{vehiculo.pais_fabricacion}</TableCell>
                      <TableCell className="text-right">
                        {vehiculo.potencia_cv}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      text="Anterior"
                      href={buildHref(currentPage - 1, sort)}
                      aria-disabled={currentPage === 1}
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : undefined
                      }
                    />
                  </PaginationItem>
                  {getPageList(currentPage, totalPages).map((page) => (
                    <PaginationItem key={page}>
                      {typeof page === "number" ? (
                        <PaginationLink
                          href={buildHref(page, sort)}
                          isActive={page === currentPage}
                        >
                          {page}
                        </PaginationLink>
                      ) : (
                        <PaginationEllipsis />
                      )}
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      text="Siguiente"
                      href={buildHref(currentPage + 1, sort)}
                      aria-disabled={currentPage === totalPages}
                      className={
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50"
                          : undefined
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
