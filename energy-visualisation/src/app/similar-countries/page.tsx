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
"use client";

// import the react library 
import React, { use, useEffect } from 'react';

// export a component that has a div with header inside that says countries
export const SimilarCountriesPage = () => { 

    // This log message currently appears in both the web browser console and the server console
    console.log("Hello from SimilarCountriesPage");

    // use the useEffect hook to log a message to the console inside of the web browser
    /*useEffect(() => {
        console.log("Hello from SimilarCountriesPage browser");
    }, []);*/



    return (
      <div>
          <h1>Countries</h1>
          {
            
          }
      </div>
    ); 
};

export default SimilarCountriesPage;