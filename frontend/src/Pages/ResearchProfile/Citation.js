import React from "react";

const Citation = () => {
  return (
    <div className="citation">
      <h1>Citation</h1>
      <table className="citation-table">
        <thead>
          <tr>
            <th>All</th>
            <th>Since</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Citations</td>
            <td>1234</td>
          </tr>
          <tr>
            <td>h-index</td>
            <td>56</td>
          </tr>
          <tr>
            <td>i-index</td>
            <td>78</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default Citation;
