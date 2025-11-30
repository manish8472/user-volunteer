import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface JobPaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  searchParams: { [key: string]: string | string[] | undefined };
}

export function JobPagination({ currentPage, totalPages, baseUrl, searchParams }: JobPaginationProps) {
  const createPageUrl = (page: number) => {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (key !== 'page' && value) {
        if (Array.isArray(value)) {
          params.set(key, value.join(','));
        } else {
          params.set(key, value);
        }
      }
    });
    params.set('page', page.toString());
    return `${baseUrl}?${params.toString()}`;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-2 mt-8">
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage <= 1}
        asChild={currentPage > 1}
      >
        {currentPage > 1 ? (
          <Link href={createPageUrl(currentPage - 1)}>Previous</Link>
        ) : (
          <span>Previous</span>
        )}
      </Button>
      
      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
        Page {currentPage} of {totalPages}
      </span>

      <Button
        variant="outline"
        size="sm"
        disabled={currentPage >= totalPages}
        asChild={currentPage < totalPages}
      >
        {currentPage < totalPages ? (
          <Link href={createPageUrl(currentPage + 1)}>Next</Link>
        ) : (
          <span>Next</span>
        )}
      </Button>
    </div>
  );
}
