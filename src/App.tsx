
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SearchPage from "./pages/SearchPage";
import DetailPage from "./pages/DetailPage";
import { Provider } from "react-redux";
import { store } from "./store";

const App: React.FC = () => {
  return (
    <Provider store= {store}>
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<SearchPage/>}/>
        <Route path="/anime/:id" element={<DetailPage />}/>
      </Routes>
      </BrowserRouter>

    </Provider>
  );

};

export default App;

