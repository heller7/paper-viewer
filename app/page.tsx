import DataTable from './components/DataTable';

export default function Home() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Publication Finder</h1>
      
      <div className="space-y-4 mb-8 text-gray-600">
        <p className="leading-relaxed">
          We used the <a href="https://arxiv.org/help/api/user-manual#query_parameters" 
            className="text-blue-600 hover:text-blue-800 underline">arXiv API</a> to 
          fetch the data. The data is not exhaustive.
        </p>
        
        <p className="leading-relaxed">Search and filter the data below.</p>
        
        <p className="leading-relaxed">
          The input search is matched against the title, authors, abstracts, and 
          pre-classifed categories (experimental). The classification is based on the abstract and 
          the title of the publication.
        </p>
      </div>

      <DataTable />
    </main>
  );
}
