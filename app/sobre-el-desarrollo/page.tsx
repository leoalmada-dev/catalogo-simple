// app/sobre-el-desarrollo/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

export const metadata: Metadata = {
    title: "Sobre el desarrollo y el autor",
    description:
        "Resumen técnico y profesional del desarrollo del catálogo Pantera mini mayorista, a cargo de Leonardo Almada.",
};

export default function SobreElDesarrolloPage() {
    return (
        <div className="space-y-6">
            <Breadcrumbs
                items={[
                    { label: "Inicio", href: "/" },
                    { label: "Sobre el desarrollo" },
                ]}
            />

            <header className="space-y-2">
                <h1 className="text-2xl font-semibold">
                    Sobre el desarrollo y el autor
                </h1>
                <p className="text-sm text-neutral-600">
                    Este catálogo fue diseñado y desarrollado por{" "}
                    <span className="font-medium text-neutral-800">
                        Leonardo Almada
                    </span>{" "}
                    como un proyecto profesional de frontend con foco en UX, accesibilidad
                    y buenas prácticas de desarrollo.
                </p>
            </header>

            <section className="space-y-3">
                <h2 className="text-lg font-semibold">Rol y enfoque</h2>
                <p className="text-sm text-neutral-700">
                    En este proyecto trabajé como desarrollador frontend con foco en:
                </p>
                <ul className="list-disc space-y-1 pl-5 text-sm text-neutral-700">
                    <li>Experiencia de usuario (UX) aplicada a catálogo y admin.</li>
                    <li>Accesibilidad AA básica: foco visible, estructura semántica, ALT y aria.</li>
                    <li>Calidad de código: TypeScript estricto, componentes reutilizables.</li>
                    <li>
                        Flujo de trabajo profesional: ramas por feature, commits pequeños y
                        CI/CD automatizado.
                    </li>
                </ul>
            </section>

            <section className="space-y-3">
                <h2 className="text-lg font-semibold">Stack técnico</h2>
                <ul className="list-disc space-y-1 pl-5 text-sm text-neutral-700">
                    <li>Next.js (App Router) con React y TypeScript.</li>
                    <li>Tailwind CSS (escala de 8pt) + componentes UI basados en shadcn/ui.</li>
                    <li>Supabase (PostgreSQL) para catálogo, variantes, imágenes y admin.</li>
                    <li>Rutas protegidas para admin usando autenticación con Supabase.</li>
                    <li>Vercel como plataforma de despliegue.</li>
                </ul>
            </section>

            <section className="space-y-3">
                <h2 className="text-lg font-semibold">Flujo de trabajo y versiones</h2>
                <p className="text-sm text-neutral-700">
                    El proyecto se trabajó con un flujo de ramas y versiones pensado para
                    escalar en el tiempo:
                </p>
                <ul className="list-disc space-y-1 pl-5 text-sm text-neutral-700">
                    <li>Ramas de feature dedicadas (por ejemplo, <code>feature/cat-07-uiux</code>).</li>
                    <li>
                        Commits atómicos y descriptivos, siguiendo prefijos como{" "}
                        <code>feat(ui):</code>, <code>fix(a11y):</code>,{" "}
                        <code>refactor:</code>, <code>style:</code>, etc.
                    </li>
                    <li>Separación clara entre catálogo público y panel de administración.</li>
                    <li>
                        Ajustes iterativos guiados por criterios de aceptación (DoD) por
                        hilo/version.
                    </li>
                </ul>
            </section>

            <section className="space-y-3">
                <h2 className="text-lg font-semibold">Calidad, tests y CI/CD</h2>
                <p className="text-sm text-neutral-700">
                    Antes de desplegar, cada cambio pasa por una serie de verificaciones
                    automáticas:
                </p>
                <ul className="list-disc space-y-1 pl-5 text-sm text-neutral-700">
                    <li>
                        <span className="font-medium">Linting:</span>{" "}
                        <code>npm run lint</code> (ESLint + reglas para React, hooks y
                        TypeScript).
                    </li>
                    <li>
                        <span className="font-medium">Type checking:</span>{" "}
                        <code>npm run typecheck</code> para asegurar tipos estrictos.
                    </li>
                    <li>
                        <span className="font-medium">Tests:</span>{" "}
                        <code>npm run test:ci</code> con Vitest y cobertura.
                    </li>
                    <li>
                        <span className="font-medium">Build de producción:</span>{" "}
                        <code>npm run build</code> para validar que la app se empaqueta sin
                        errores.
                    </li>
                    <li>
                        Pipeline de CI en GitHub Actions que solo despliega a Vercel si
                        todos estos pasos pasan en verde.
                    </li>
                </ul>
            </section>

            <section className="space-y-3">
                <h2 className="text-lg font-semibold">
                    UX, accesibilidad y SEO en el catálogo
                </h2>
                <ul className="list-disc space-y-1 pl-5 text-sm text-neutral-700">
                    <li>
                        <span className="font-medium">Accesibilidad:</span> skip link al
                        contenido, un <code>h1</code> por página, foco visible, estados
                        vacíos y de error claros, ALT significativos en imágenes.
                    </li>
                    <li>
                        <span className="font-medium">UX en catálogo:</span> filtros
                        persistentes por URL, búsqueda tolerante a tildes, paginación
                        accesible, skeletons de carga y mensajes de “sin resultados”.
                    </li>
                    <li>
                        <span className="font-medium">UX en producto:</span> selector de
                        variantes vinculado a imágenes, CTA de WhatsApp contextual, precios
                        y stock visibles cuando aplica.
                    </li>
                    <li>
                        <span className="font-medium">SEO técnico:</span> metadatos por
                        página, Open Graph, JSON-LD para organización y productos, sitemap y
                        robots configurados, verificación con Google Search Console.
                    </li>
                </ul>
            </section>

            <section className="space-y-3">
                <h2 className="text-lg font-semibold">Panel de administración</h2>
                <p className="text-sm text-neutral-700">
                    El admin permite gestionar el catálogo de manera eficiente:
                </p>
                <ul className="list-disc space-y-1 pl-5 text-sm text-neutral-700">
                    <li>
                        Login protegido con Supabase y layout específico para administración.
                    </li>
                    <li>
                        Edición de productos con variantes, estado (borrador/publicado/archivado) y
                        validación con Zod.
                    </li>
                    <li>
                        Importación y exportación de productos vía CSV, con feedback
                        detallado.
                    </li>
                    <li>
                        Gestor de imágenes con subida múltiple, selección de imagen
                        principal, ALT editable y asociación opcional a variantes.
                    </li>
                    <li>
                        Actualización de estado con UI optimista, transiciones y toasts de
                        éxito/error.
                    </li>
                </ul>
            </section>

            <section className="space-y-3">
                <h2 className="text-lg font-semibold">Seguimiento y analítica</h2>
                <p className="text-sm text-neutral-700">
                    El catálogo está preparado para entender mejor el origen de las
                    consultas:
                </p>
                <ul className="list-disc space-y-1 pl-5 text-sm text-neutral-700">
                    <li>Captura de parámetros UTM en la URL y almacenamiento temporal.</li>
                    <li>
                        Generación de enlaces de WhatsApp con tracking (<code>/w</code>) que
                        incluyen producto, variante, origen y otros datos relevantes.
                    </li>
                    <li>
                        Diseño pensado para conectar fácilmente con herramientas de
                        analítica en el futuro.
                    </li>
                </ul>
            </section>

            <section className="space-y-3">
                <h2 className="text-lg font-semibold">Contacto</h2>
                <p className="text-sm text-neutral-700">
                    Si te interesa este tipo de trabajo o querés hablar sobre nuevos
                    proyectos, podés escribirme a:
                </p>
                <p className="text-sm font-medium text-neutral-900">
                    <a
                        href="mailto:leoalmada-dev@gmail.com"
                        className="underline hover:text-neutral-700"
                    >
                        leoalmada-dev@gmail.com
                    </a>
                </p>
                <p className="text-xs text-neutral-500">
                    En el futuro voy a centralizar mis proyectos y experiencia en una
                    página personal. Este catálogo es el primer paso de ese camino.
                </p>
            </section>

            <div className="pt-2">
                <Link
                    href="/"
                    className="text-sm text-neutral-700 underline hover:text-neutral-900"
                >
                    ← Volver al catálogo
                </Link>
            </div>
        </div>
    );
}
