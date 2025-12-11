// app/sobre-el-desarrollo/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

export const metadata: Metadata = {
    title: "Sobre el desarrollo y el autor",
    description:
        "Resumen profesional del desarrollo del catálogo Pantera mini mayorista, a cargo de Leonardo Almada.",
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

            {/* Intro */}
            <header className="space-y-2">
                <h1 className="text-2xl font-semibold">Sobre el desarrollo y el autor</h1>
                <p className="text-sm text-neutral-600">
                    Este catálogo fue diseñado y desarrollado por{" "}
                    <span className="font-medium text-neutral-800">Leonardo Almada</span>, como
                    un proyecto profesional orientado a negocios mayoristas, con foco en UX,
                    confiabilidad y una base técnica preparada para crecer.
                </p>
            </header>

            {/* Rol y enfoque */}
            <section className="space-y-3">
                <h2 className="text-lg font-semibold">Rol y enfoque</h2>
                <p className="text-sm text-neutral-700">
                    En este proyecto asumí el rol de desarrollador frontend con responsabilidad
                    sobre la experiencia completa del catálogo: desde la navegación pública hasta
                    el panel de administración. El objetivo no fue solo “que funcione”, sino
                    construir algo que transmita orden, cuidado y criterio profesional.
                </p>
                <ul className="list-disc space-y-1 pl-5 text-sm text-neutral-700">
                    <li>Diseño de la experiencia de catálogo pensando en el usuario final.</li>
                    <li>Construcción de un panel de administración simple pero potente.</li>
                    <li>Código tipado con TypeScript y componentes reutilizables.</li>
                    <li>
                        Flujo de trabajo similar al de un entorno de producción real
                        (versionado, pruebas y despliegue continuo).
                    </li>
                </ul>
            </section>

            {/* Stack técnico (alto nivel) */}
            <section className="space-y-3">
                <h2 className="text-lg font-semibold">Tecnología utilizada</h2>
                <p className="text-sm text-neutral-700">
                    La elección de tecnologías apunta a un stack moderno y estándar en la
                    industria, para que el proyecto sea mantenible y fácil de extender:
                </p>
                <ul className="list-disc space-y-1 pl-5 text-sm text-neutral-700">
                    <li>
                        <span className="font-medium">Next.js + React:</span> aplicación con App
                        Router, rutas públicas y privadas, y enfoque en rendimiento.
                    </li>
                    <li>
                        <span className="font-medium">TypeScript:</span> tipado estático para
                        reducir errores y documentar mejor la intención del código.
                    </li>
                    <li>
                        <span className="font-medium">Tailwind CSS:</span> diseño limpio,
                        consistente, y adaptable a mobile/escritorio.
                    </li>
                    <li>
                        <span className="font-medium">Supabase (PostgreSQL):</span> base de datos,
                        autenticación y almacenamiento de imágenes integrados.
                    </li>
                    <li>
                        <span className="font-medium">Vercel:</span> plataforma de despliegue
                        orientada a proyectos frontend modernos.
                    </li>
                </ul>
            </section>

            {/* Flujo de trabajo y calidad */}
            <section className="space-y-3">
                <h2 className="text-lg font-semibold">Calidad y flujo de trabajo</h2>
                <p className="text-sm text-neutral-700">
                    El proyecto se trabajó con una mentalidad de producto real, no como un
                    experimento rápido. Cada cambio pasa por una serie de chequeos antes de
                    llegar a producción:
                </p>
                <ul className="list-disc space-y-1 pl-5 text-sm text-neutral-700">
                    <li>
                        Validaciones automáticas de código (linting, tipos y build de producción).
                    </li>
                    <li>
                        Tests automatizados para funciones clave y utilidades (por ejemplo, tracking
                        de WhatsApp).
                    </li>
                    <li>
                        Integración continua: el despliegue sólo ocurre si todo está en verde.
                    </li>
                    <li>
                        Uso de Git y ramas por funcionalidad, con commits pequeños y descriptivos.
                    </li>
                </ul>
                <p className="text-sm text-neutral-700">
                    La idea es que el catálogo se pueda seguir manteniendo con confianza a medida
                    que el negocio crezca o cambien los requisitos.
                </p>
            </section>

            {/* UX, accesibilidad y SEO */}
            <section className="space-y-3">
                <h2 className="text-lg font-semibold">Experiencia de uso y SEO</h2>
                <p className="text-sm text-neutral-700">
                    Más allá de lo técnico, el foco principal es que la persona que usa el
                    catálogo pueda encontrar y consultar productos sin fricción:
                </p>
                <ul className="list-disc space-y-1 pl-5 text-sm text-neutral-700">
                    <li>
                        Filtros por categoría y búsqueda por texto conectados a la URL, para poder
                        compartir resultados fácilmente.
                    </li>
                    <li>
                        Página de producto con galería de imágenes, variantes, y botón directo de
                        consulta por WhatsApp.
                    </li>
                    <li>
                        Estados vacíos y páginas de error pensados para guiar al usuario en lugar de
                        “dejarlos tirados”.
                    </li>
                    <li>
                        Metadatos, Open Graph y sitemap configurados para que el catálogo se indexe
                        correctamente en buscadores.
                    </li>
                </ul>
            </section>

            {/* Visibilidad de precios (explicación elegante) */}
            <section className="space-y-3">
                <h2 className="text-lg font-semibold">Gestión flexible de precios</h2>
                <p className="text-sm text-neutral-700">
                    Una parte importante del proyecto fue diseñar cómo se muestran los precios
                    hacia el cliente. El catálogo está preparado para adaptarse a distintas
                    estrategias comerciales, sin tener que tocar el código cada vez.
                </p>
                <ul className="list-disc space-y-1 pl-5 text-sm text-neutral-700">
                    <li>
                        Un control global permite encender o apagar la visibilidad de precios en
                        todo el sitio.
                    </li>
                    <li>
                        Cada producto puede comportarse como una excepción, mostrando u ocultando
                        precios según la necesidad del negocio.
                    </li>
                    <li>
                        El panel de administración incluye un mini panel para ajustar este
                        comportamiento de forma segura y rápida.
                    </li>
                </ul>
                <p className="text-sm text-neutral-700">
                    Esto refleja una forma de trabajar donde la lógica del negocio está pensada
                    para el largo plazo, contemplando cambios de estrategia sin rediseñar el
                    sistema completo.
                </p>
            </section>

            {/* Panel de administración */}
            <section className="space-y-3">
                <h2 className="text-lg font-semibold">Panel de administración</h2>
                <p className="text-sm text-neutral-700">
                    El panel interno está diseñado para que la gestión diaria del catálogo no
                    dependa de un desarrollador:
                </p>
                <ul className="list-disc space-y-1 pl-5 text-sm text-neutral-700">
                    <li>Creación y edición de productos con variantes y estados.</li>
                    <li>
                        Importación y exportación de productos vía CSV, para actualizar el catálogo
                        en bloque.
                    </li>
                    <li>Gestión de imágenes: subida múltiple, imagen principal y texto ALT.</li>
                    <li>
                        Control rápido del estado de cada producto (borrador, publicado,
                        archivado).
                    </li>
                    <li>
                        Configuración global de visibilidad de precios accesible desde el mismo
                        panel.
                    </li>
                </ul>
            </section>

            {/* Contacto */}
            <section className="space-y-3">
                <h2 className="text-lg font-semibold">Sobre mí y contacto</h2>
                <p className="text-sm text-neutral-700">
                    Soy <span className="font-medium text-neutral-900">Leonardo Almada</span>,
                    desarrollador frontend. Me interesa construir productos que combinen:
                </p>
                <ul className="list-disc space-y-1 pl-5 text-sm text-neutral-700">
                    <li>Experiencias claras y simples para el usuario final.</li>
                    <li>Código prolijo, legible y fácil de mantener.</li>
                    <li>Procesos de trabajo que se parezcan a un entorno profesional real.</li>
                </ul>
                <p className="text-sm text-neutral-700">
                    Este catálogo es uno de los primeros pasos de un camino en el que quiero
                    seguir creando soluciones a medida para negocios reales.
                </p>
                <p className="text-sm font-medium text-neutral-900">
                    Si querés hablar sobre proyectos o colaborar en algo similar, podés
                    contactarme en:
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
                    Más adelante voy a centralizar mis proyectos en un portfolio personal. Este
                    sitio es el inicio de ese camino.
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
