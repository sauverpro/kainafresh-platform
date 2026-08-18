import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiGet } from "../../api/client";
import { Loader2, Pencil } from "lucide-react";
import HomePageForm from "./forms/HomePageForm";
import AboutPageForm from "./forms/AboutPageForm";
import FarmPageForm from "./forms/FarmPageForm";

interface PageSection {
  id: string;
  title: string;
  content: string;
}

interface PageData {
  id: number;
  title: string;
  slug: string;
  status: string;
  seo_title: string | null;
  seo_description: string | null;
  sections: PageSection[];
}

interface ApiResponse {
  success: boolean;
  data: PageData;
}

const FORM_MAP: Record<string, React.ComponentType<{ pageId: string }>> = {
  home: HomePageForm,
  "about us": AboutPageForm,
  farm: FarmPageForm,
};

function PageContent({ id }: { id: string }) {
  const [page, setPage] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    apiGet<ApiResponse>(`/api/pages/${id}`)
      .then((res) => { if (!ctrl.signal.aborted) setPage(res.data); })
      .catch((err: Error) => { if (!ctrl.signal.aborted) setError(err.message); })
      .finally(() => { if (!ctrl.signal.aborted) setLoading(false); });
    return () => ctrl.abort();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
      </div>
    );
  }

  if (error) {
    return <div className="py-20 text-center text-red-500">{error}</div>;
  }

  if (!page) {
    return <div className="py-20 text-center text-gray-400">Page not found</div>;
  }

  const FormComponent = FORM_MAP[page.slug.toLowerCase()];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {page.title}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Slug: {page.slug} &middot; Status: {page.status}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-brand-600">
          <Pencil className="h-4 w-4" />
          Editing
        </div>
      </div>

      {page.seo_title && (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          SEO Title: {page.seo_title}
        </p>
      )}
      {page.seo_description && (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          SEO Description: {page.seo_description}
        </p>
      )}

      {FormComponent ? (
        <FormComponent pageId={id} />
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-gray-900">
          <h3 className="mb-2 font-semibold text-gray-800 dark:text-white">
            No editor available for this page
          </h3>
          <p className="text-sm text-gray-500">
            A custom form for "{page.title}" has not been created yet.
          </p>
        </div>
      )}
    </div>
  );
}

export default function CrmPage() {
  const { id } = useParams<{ id: string }>();
  if (!id) return null;
  return <PageContent key={id} id={id} />;
}
