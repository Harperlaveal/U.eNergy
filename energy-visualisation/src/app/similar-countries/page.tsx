/**
 * @packageDocumentation
 * @module SimilarCountriesPage
 * Contains the SimilarCountriesPage component
 * 
 * To start the app run the following command
 * "npm run dev"
 * 
 * The website will be available at http://localhost:3000/similar-countries
 * 
 */
// This statement causes our code to run in the client web browser instead of the server. Console log messages appear in the web browser.
"use client";

// import the react library 
import React, { use, useEffect } from 'react';

// export a component that has a div with header inside that says countries
export const SimilarCountriesPage = () => { 

    // This log message currently appears in both the web browser console and the server console
    console.log("Hello from SimilarCountriesPage");

    return (
      <div>
          <h1>Countries</h1>
          {
            
          }
      </div>
    ); 
};

export default SimilarCountriesPage;