import Form from "react-bootstrap/Form";

function SearchBar() {
  return (
    <>
      <Form.Control
        type="text"
        placeholder="Enter your search query here..."
        style={{ height: "5vh", width: "80%", fontSize: "0.8em" }}
      />
    </>
  );
}

export default SearchBar;
