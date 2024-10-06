import React from 'react';
import { useTable, useSortBy } from 'react-table';
import exoplanetData from '../data/exoplanets.json';

const ExoplanetTable = () => {
  const data = React.useMemo(() => exoplanetData, []);
  const columns = React.useMemo(
    () => [
      { Header: 'Name', accessor: 'name' },
      { Header: 'Mass', accessor: 'mass' },
      { Header: 'Radius', accessor: 'radius' },
      { Header: 'Orbital Period', accessor: 'orbital_period' },
      { Header: 'Discovery Year', accessor: 'discovered' },
      { Header: 'Distance', accessor: 'distance' }
    ],
    []
  );

  const tableInstance = useTable({ columns, data }, useSortBy);
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = tableInstance;

  return (
    <div className="table-container">
      <h2>Exoplanet Data Table</h2>
      <table {...getTableProps()} className="exoplanet-table">
        <thead>
          {headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                  {column.render('Header')}
                  <span>
                    {column.isSorted ? (column.isSortedDesc ? ' 🔽' : ' 🔼') : ''}
                  </span>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map(row => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map(cell => (
                  <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ExoplanetTable;
