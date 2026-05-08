function SearchBar({ setSearch }) {
  return (
    <input
      className="form-control mb-3"
      placeholder="Search vegetables..."
      onChange={(e) => setSearch(e.target.value)}
    />
  );
}

export default SearchBar;