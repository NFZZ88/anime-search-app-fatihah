import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./store";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SearchPage from "./pages/SearchPage";
import DetailPage from "./pages/DetailPage";

function App(){
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SearchPage/>}/>
          <Route path="/detail/:id" element={<DetailPage/>}/>
        </Routes>
      </BrowserRouter>
    )
}

createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <App/>

  </Provider>
)