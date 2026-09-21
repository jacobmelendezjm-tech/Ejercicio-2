import { ChevronDownIcon, ChevronUpIcon, SearchIcon } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import vehiculosData from "@/public/json/vehiculos_200.json"
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

function buildHref(page: number, sort: "asc" | "desc" | null, q: string) {
  const query = new URLSearchParams({ page: String(page) })
  if (sort) query.set("sort", sort)
  if (q) query.set("q", q)
  return `?${query}`
}

// Minúsculas y sin acentos, para que "turquia" encuentre "Turquía".
function normalize(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
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
  const q = (typeof params.q === "string" ? params.q : "").trim().slice(0, 100)
  const needle = normalize(q)
  const vehiculos: Vehiculo[] = vehiculosData.filter(
    (v) =>
      !needle ||
      normalize(
        `${v.id} ${v.marca} ${v.modelo} ${v.pais_fabricacion} ${v.potencia_cv}`
      ).includes(needle)
  )
  if (sort) {
    vehiculos.sort((a, b) =>
      sort === "desc"
        ? b.potencia_cv - a.potencia_cv
        : a.potencia_cv - b.potencia_cv
    )
  }
  const media = vehiculos.length
    ? vehiculos.reduce((sum, v) => sum + v.potencia_cv, 0) / vehiculos.length
    : null
  const masCercano =
    media !== null
      ? vehiculos.reduce((best, v) =>
          Math.abs(v.potencia_cv - media) < Math.abs(best.potencia_cv - media)
            ? v
            : best
        )
      : null
  const masCutre = vehiculos.length
    ? vehiculos.reduce((min, v) => (v.potencia_cv < min.potencia_cv ? v : min))
    : null
  const masPotente = vehiculos.length
    ? vehiculos.reduce((max, v) => (v.potencia_cv > max.potencia_cv ? v : max))
    : null
  const stats = [
    {
      title: "Potencia media",
      value: media === null ? "—" : `${media.toFixed(1)} CV`,
      detail: q ? `Media de los resultados de "${q}"` : "Media de todos los vehículos",
      extra: masCercano
        ? `Más cercano: ${masCercano.marca} ${masCercano.modelo} (${masCercano.potencia_cv} CV)`
        : null,
    },
    {
      title: "Coche más cutre",
      value: masCutre ? `${masCutre.marca} ${masCutre.modelo}` : "—",
      detail: masCutre ? `${masCutre.potencia_cv} CV · ${masCutre.pais_fabricacion}` : "Sin resultados",
    },
    {
      title: "Coche más potente",
      value: masPotente ? `${masPotente.marca} ${masPotente.modelo}` : "—",
      detail: masPotente ? `${masPotente.potencia_cv} CV · ${masPotente.pais_fabricacion}` : "Sin resultados",
    },
  ]
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
        <div className="grid min-h-svh grid-cols-12 items-start gap-4">
          <Card className="col-span-12 lg:col-span-9">
            <CardHeader>
              <CardTitle>Vehículos</CardTitle>
              <CardDescription>
                {vehiculos.length} vehículos
                {q ? ` para "${q}"` : ""}. Página {currentPage} de {totalPages}.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <form method="get" className="flex w-full max-w-sm gap-2">
                {sort && <input type="hidden" name="sort" value={sort} />}
                <div className="relative flex-1">
                  <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="search"
                    name="q"
                    defaultValue={q}
                    placeholder="Buscar por marca, modelo, país…"
                    aria-label="Buscar vehículos"
                    className="pl-8"
                  />
                </div>
                <Button type="submit" size="default">
                  Buscar
                </Button>
              </form>
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
                                    href={buildHref(1, isActive ? null : value, q)}
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
                  {pageItems.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="py-6 text-center text-muted-foreground"
                      >
                        No hay vehículos que coincidan con la búsqueda.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      text="Anterior"
                      href={buildHref(currentPage - 1, sort, q)}
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
                          href={buildHref(page, sort, q)}
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
                      href={buildHref(currentPage + 1, sort, q)}
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
          <div className="col-span-12 flex flex-col gap-4 lg:col-span-3">
            {stats.map((stat) => (
              <Card key={stat.title}>
                <CardHeader>
                  <CardDescription>{stat.title}</CardDescription>
                  <CardTitle className="text-2xl">{stat.value}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{stat.detail}</p>
                  {"extra" in stat && stat.extra && (
                    <p className="mt-2 text-sm font-medium">{stat.extra}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
