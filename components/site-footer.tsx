// components/site-footer.tsx
import Link from "next/link";

const AUTHOR_NAME = "Leonardo Almada";
const AUTHOR_EMAIL = "leoalmada-dev@gmail.com";

export default function SiteFooter() {
    return (
        <footer className="border-t bg-white">
            <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-neutral-500 sm:flex-row">
                <span>
                    © {new Date().getFullYear()} Pantera mini mayorista.
                </span>

                <div className="flex flex-wrap items-center justify-center gap-2">
                    <span>
                        Desarrollado por{" "}
                        <span className="font-medium text-neutral-700">
                            {AUTHOR_NAME}
                        </span>
                    </span>

                    <a
                        href={`mailto:${AUTHOR_EMAIL}`}
                        className="underline hover:text-neutral-800"
                    >
                        Contacto
                    </a>

                    <Link
                        href="/sobre-el-desarrollo"
                        className="underline hover:text-neutral-800"
                    >
                        Sobre el desarrollo
                    </Link>
                </div>
            </div>
        </footer>
    );
}
