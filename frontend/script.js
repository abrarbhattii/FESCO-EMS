import { 
  handleCheckboxChange ,
  handleExpandButtonClick
} 
from "./controllers.js";

let geom = {};

require([
  "esri/Map",
  "esri/views/MapView",
  "esri/widgets/BasemapGallery",
  "esri/layers/FeatureLayer",
], function (
  Map,
  MapView,
  BasemapGallery,
  FeatureLayer,
) {
  const map = new Map({
    basemap: "topo-vector",
  });

  const view = new MapView({
    container: "viewDiv",
    map: map,
    center: [69.3451, 30.3753],
    zoom: 6,
  });


  // Basemap Gallery in sidebar
  const basemapGallery = new BasemapGallery({
    view: view,
    container: "basemapPanel",
    group: "header-tools",
  });

  const basemapBtn = document.getElementById("basemapBtn");
  const basemapPanel = document.getElementById("basemapPanel");
  const sidebar = document.querySelector(".sidebar");

  if (basemapBtn && basemapPanel) {
    basemapBtn.addEventListener("click", () => {
      const isOpen = basemapPanel.classList.toggle("open");
      basemapBtn.setAttribute("aria-expanded", String(isOpen));
      basemapPanel.setAttribute("aria-hidden", String(!isOpen));
      if (sidebar) {
        sidebar.classList.toggle(
          "open",
          isOpen || layersPanel?.classList.contains("open"),
        );
      }
    });
  }


  const layersBtn = document.getElementById("layersBtn");
  const layersPanel = document.getElementById("layersPanel");

  if (layersBtn && layersPanel) {
    layersBtn.addEventListener("click", () => {
      const isOpen = layersPanel.classList.toggle("open");
      layersBtn.setAttribute("aria-expanded", String(isOpen));
      layersPanel.setAttribute("aria-hidden", String(!isOpen));
      if (sidebar) {
        sidebar.classList.toggle(
          "open",
          isOpen || basemapPanel?.classList.contains("open"),
        );
      }
    });
  }


  const tree = document.getElementById("tree");
  // Store layer references outside the event handler
  const activeLayers = {};

  tree.addEventListener("change", async (e) => {
    handleCheckboxChange(e, FeatureLayer, activeLayers, map, view);
  });

  tree.addEventListener("click", async (e) => {
    handleExpandButtonClick(e);
  });

});


