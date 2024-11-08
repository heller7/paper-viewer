"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import "katex/dist/katex.min.css";
import { InlineMath } from "react-katex";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Publication {
  id: number;
  source: string;
  title: string;
  authors: string;
  abstract: string | null;
  categories: string | null;
  arxiv_category: string | null;
  link: string;
  date_fetched: string;
  publication_date: string | null;
  doi: string | null;
}

interface ModalProps {
  abstract: string;
  onClose: () => void;
}

function AbstractModal({ abstract, onClose }: ModalProps) {
  // Function to process text and wrap LaTeX in components
  const renderLatex = (text: string) => {
    const parts = text.split(/(\$.*?\$)/g);
    return parts.map((part, index) => {
      if (part.startsWith("$") && part.endsWith("$")) {
        // Remove the dollar signs and render as LaTeX
        const latex = part.slice(1, -1);
        try {
          return <InlineMath key={index} math={latex} />;
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
          // Fallback if LaTeX parsing fails
          return part;
        }
      }
      return part;
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <div className="prose prose-sm mt-4">
          <ReactMarkdown
            components={{
              // Custom renderer for paragraphs to handle LaTeX
              p: ({ children }) => (
                <p>{children ? renderLatex(children.toString()) : ""}</p>
              ),
            }}
          >
            {abstract}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

export default function DataTable() {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const ITEMS_PER_PAGE = 20;
  const [selectedAbstract, setSelectedAbstract] = useState<string | null>(null);
  const [categorySearch, setCategorySearch] = useState("");
  // const [generalFilter, setGeneralFilter] = useState<string[]>([]);
  // const [generalCategories, setGeneralCategories] = useState<string[]>([]);

  const toggleSelection = (id: number) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          search,
          arxivFilter: filter.join(","),
          //generalFilter: generalFilter.join(","),
          page: page.toString(),
          limit: ITEMS_PER_PAGE.toString(),
        });
        const response = await fetch(`/api/items?${params}`);
        const data = await response.json();

        if (page === 1) {
          setPublications(data);
        } else {
          setPublications((prev) => [...prev, ...data]);
        }

        setHasMore(data.length === ITEMS_PER_PAGE);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [search, filter, page]);

  // Reset page when search or filter changes
  useEffect(() => {
    setPage(1);
  }, [search, filter]);

  // Fetch unique categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const [arxivResponse, generalResponse] = await Promise.all([
          fetch("/api/arxiv-categories"),
          fetch("/api/arxiv-categories")   // fetch("/api/general-categories")
        ]);
        
        if (!arxivResponse.ok || !generalResponse.ok) 
          throw new Error("Failed to fetch categories");
        
          const arxivData = await arxivResponse.json();
        
        setCategories(Array.isArray(arxivData) ? arxivData : []);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  console.log("Current categories state:", categories);

  return (
    <div className="p-4">
      {/* Search and Filter Controls */}
      <div className="mb-4 space-y-4">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 border rounded w-full"
        />

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Arxiv Categories
          </label>

          <div className="flex items-center gap-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                  <Filter className="h-4 w-4" />
                  {filter.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                      {filter.length}
                    </span>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Arxiv Categories</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 pt-4">
                  <input
                    type="text"
                    placeholder="Search categories..."
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    className="p-2 border rounded w-full"
                  />

                  <ScrollArea className="h-[400px] w-full rounded-md border">
                    <ToggleGroup
                      type="multiple"
                      value={filter}
                      onValueChange={(values) => setFilter(values)}
                      className="grid grid-cols-6 gap-2 p-2"
                    >
                      {categories
                        .filter((category) =>
                          category
                            .toLowerCase()
                            .includes(categorySearch.toLowerCase())
                        )
                        .map((category) => (
                          <ToggleGroupItem
                            key={category}
                            value={category}
                            className="data-[state=on]:bg-blue-100 data-[state=on]:text-blue-800"
                          >
                            {category}
                          </ToggleGroupItem>
                        ))}
                    </ToggleGroup>
                  </ScrollArea>

                  <div className="flex flex-wrap gap-2">
                    {filter.length > 0 ? (
                      filter.map((category) => (
                        <span
                          key={category}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {category}
                          <button
                            onClick={() =>
                              setFilter(filter.filter((f) => f !== category))
                            }
                            className="hover:text-blue-600"
                          >
                            ×
                          </button>
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500 text-sm">
                        No categories selected
                      </span>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <div className="flex flex-wrap gap-2">
              {filter.length > 0 ? (
                filter.map((category) => (
                  <span
                    key={category}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {category}
                    <button
                      onClick={() =>
                        setFilter(filter.filter((f) => f !== category))
                      }
                      className="hover:text-blue-600"
                    >
                      ×
                    </button>
                  </span>
                ))
              ) : (
                <span className="text-gray-500 text-sm">
                  No categories selected
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

{/* General Categories 
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">General Categories</label>
        <div className="flex items-center gap-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" className="relative">
                <Filter className="h-4 w-4" />
                {generalFilter.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                    {generalFilter.length}
                  </span>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>General Categories</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 pt-4">
                <ScrollArea className="h-[400px] w-full rounded-md border">
                  <ToggleGroup 
                    type="multiple" 
                    value={generalFilter}
                    onValueChange={(values) => setGeneralFilter(values)}
                    className="grid grid-cols-6 gap-2 p-2"
                  >
                    {generalCategories.map((category) => (
                      <ToggleGroupItem 
                        key={category} 
                        value={category}
                        className="data-[state=on]:bg-blue-100 data-[state=on]:text-blue-800"
                      >
                        {category}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                </ScrollArea>

                <div className="flex flex-wrap gap-2">
                  {generalFilter.map((category) => (
                    <span
                      key={category}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {category}
                      <button
                        onClick={() => setGeneralFilter(generalFilter.filter(f => f !== category))}
                        className="hover:text-blue-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <div className="flex flex-wrap gap-2">
            {generalFilter.length > 0 ? (
              generalFilter.map((category) => (
                <span
                  key={category}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {category}
                  <button
                    onClick={() => setGeneralFilter(generalFilter.filter(f => f !== category))}
                    className="hover:text-blue-600"
                  >
                    ×
                  </button>
                </span>
              ))
            ) : (
              <span className="text-gray-500 text-sm">No categories selected</span>
            )}
          </div>
        </div>
      </div> 
*/}
      {/* Modal */}
      {selectedAbstract && (
        <AbstractModal
          abstract={selectedAbstract}
          onClose={() => setSelectedAbstract(null)}
        />
      )}

      {/* Data Table */}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="border rounded overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-10 px-6 py-3"></th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Authors
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Published
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Source
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  DOI
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Array.isArray(publications) &&
                publications.map((pub) => (
                  <tr
                    key={pub.id}
                    className={`hover:bg-gray-50 ${
                      selectedItems.includes(pub.id) ? "bg-blue-50" : ""
                    }`}
                  >
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleSelection(pub.id)}
                        className="text-gray-400 hover:text-blue-600"
                      >
                        {selectedItems.includes(pub.id) ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <a
                          href={pub.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {pub.title}
                        </a>
                        {pub.abstract && (
                          <p
                            onClick={() => setSelectedAbstract(pub.abstract!)}
                            className="text-sm text-gray-500 mt-1 line-clamp-2 cursor-pointer hover:text-gray-700"
                          >
                            {pub.abstract}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">{pub.authors}</td>
                    <td className="px-6 py-4 text-sm">
                      {pub.arxiv_category || pub.categories || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {pub.publication_date || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm">{pub.source}</td>
                    <td className="px-6 py-4 text-sm">
                      {pub.doi ? (
                        <a
                          href={`https://doi.org/${pub.doi}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {pub.doi}
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Load More Button */}
      {!loading && hasMore && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
}
