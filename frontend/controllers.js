import { serviceURL } from "./constant.js";

function removeLastOccurrence(str, substring) {
    const index = str.lastIndexOf(substring);
    return index === -1
        ? str
        : str.slice(0, index) + str.slice(index + substring.length);
}

function endpointSelection(endpoint) {
    let targetEndpoint = '';
    switch (endpoint) {
        case 'circles':
            targetEndpoint = 'divisions';
            return targetEndpoint;
        case 'divisions':
            targetEndpoint = 'sub_divisions';
            return targetEndpoint;
        case 'sub_divisions':
            targetEndpoint = 'stations';
            return targetEndpoint;
        case 'stations':
            targetEndpoint = 'feeders';
            return targetEndpoint;
        // case 'feeders':
        //     targetEndpoint = 'layers';
        //     return targetEndpoint;
        case 'feeders':
            targetEndpoint = 'HTLayers';
            return targetEndpoint;

        default:
            console.log("Invalid Endpoint");
            break;
    }
}


function buildTree(data, parentElement) {

    // console.log("data: ", data);
    // console.log('parentElement: ', parentElement);  

    const dt = data.divisions || data.subdivisions || data.stations || data.feeders || data.layers;

    // console.log('dt: ', dt);
    
    

    dt.forEach((item, i) => {

        // console.log('item: ', item);

        const label = document.createElement("span");
        label.textContent =
            item.division_name ||
            item.sub_division_name ||
            item.station_name ||
            item.feeder_name ||
            item.section_id;

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        
        const toggleBtn = document.createElement("button");
        toggleBtn.classList.add("toggle", "togglebtn", "togglebtn-circles");
        // toggleBtn.setAttribute("data-endpoint", TargetEndpoint);
        // toggleBtn.setAttribute("data-id", idValue);
        toggleBtn.setAttribute("aria-expanded", "false");
        toggleBtn.textContent = "+";


        const li = document.createElement("li");
        li.classList.add(`parent-li-circle`, `parent-li-circle-${i+1}`);
        // li.innerHTML = generateNewLiHTML(endpoint, TargetEndpoint, idValue, layerId2, nameValue);

        li.appendChild(toggleBtn);
        li.appendChild(checkbox);
        li.appendChild(label);
        

        const childUL = document.createElement("ul");
        childUL.classList.add("tree-children");
        childUL.appendChild(li);

        // console.log("childUL: ", childUL);
        
        // parentElement.appendChild(childUL);
        childUL.style.display = "block";



        let keyy = "";

        if (item.subdivisions) {
            keyy = "subdivisions";
        } else if(item.stations) {
            keyy = "stations";
        } else if(item.feeders) {
            keyy = "feeders";
        } else if(item.layers) {
            keyy = "layers";
        }

        // console.log('key: ', keyy);
        
        
        // detect child arrays
        const children =
            item.subdivisions ||
            item.stations ||
            item.feeders ||
            item.layers;

        // console.log('children: ', children);
        

        if (children && children.length > 0) {

            buildTree({[keyy]: children}, li);
        }

    });

}
// const treeContainer = document.getElementById("tree");

// buildTree(response.divisions, treeContainer);
let circleLayerId = null;
async function handleCheckboxChange(e, FeatureLayer, activeLayers, map, view) {
    const checkbox = e.target;
    const layerId = checkbox.dataset.id || null;
    const serviceUrl = serviceURL;

    if (checkbox.classList.contains("parent-checkbox")) {
        // console.log("target", e.target);

        // find all child checkboxes inside this parent group
        const container = checkbox.closest('.parent-li-circle');
        // console.log('container', container);

        const childrenBtn = container.querySelectorAll('Button.toggle');
        // console.log('childrenBtn', childrenBtn);

        childrenBtn.forEach(btn => {
            // btn.click();
            // alert("Child button clicked");
            // btn.textContent = "+";
            // btn.setAttribute("aria-expanded", "false");
        });
        
        const children = container.querySelectorAll('input[type="checkbox"]');
        // console.log('children', children);

        children.forEach(cb => {
            // cb.checked = checkbox.checked;
            // console.log('cb', cb);
            // cb.dispatchEvent(new Event('change')); // Trigger change event for each child checkbox       
        });

    };

    // if (!checkbox.classList.contains("LayerOnOff") || !layerId) return;

    const circleId = checkbox.classList[0].at(7);
    if (checkbox.checked) {
        
        // console.log(circleId);

        let idStarting = '';

        let definExpression = '1=1'; // Default expression to show all features
        if (checkbox.classList.contains("LayerOnOff")) {
            
            definExpression = `HTSectionLayer_id = ${layerId}`; // Filter features where LayerID matches the checkbox's data-id
            circleLayerId = layerId;
            console.log("layerId: ", circleLayerId);
            idStarting = 'l';

        } else if (checkbox.classList.contains("parent-checkbox")) {
            
            definExpression = `circle_id = ${circleId}`; // Assuming child features have a field like "circle_id" that matches the parent checkbox's data-id
            circleLayerId = circleId;
            console.log("circleId: ", circleLayerId);
            idStarting = 'c';
            

            // const toggleBtn = checkbox.previousElementSibling; // Assuming the toggle button is immediately before the checkbox
            // // console.log("toggleBtn: ", toggleBtn);
            
            // const endpoint = toggleBtn.dataset.endpoint;
            // // console.log("endpoint: ", endpoint);

            // const TargetEndpoint = endpointSelection(endpoint);
            // // console.log("TargetEndpoint: ", TargetEndpoint);

            // const key = removeLastOccurrence(endpoint, 's');
            // // console.log("key: ", key);


            // let url = `http://localhost:3000/api/circle-hierarchy/${circleId}`;
            // const res = await fetch(url);
            // const data = await res.json();
            // console.log(data);


            // let layerId2 = '';
            // let idValue = '';
            // let nameValue = '';

            // data.forEach(dt => {
            //     if (endpoint == "HTLayers") {
            //         layerId2 = dt[`HTSectionLayer_id`];
            //         nameValue = dt[`section_id`];
            //         feederID = dt['feeder_id'];
            //         geom = dt['geom'];
            //         geomText = dt[`geom_text`];
            //         colorCode = dt[`color_code`];
            //         conductorName = dt[`conductor_name`];
            //     } else {
            //         idValue = dt[`${key}_id`];
            //         nameValue = dt[`${key}_name`];
            //     }
            // });


            // const targetli = checkbox.closest("li");
            // console.log('targetli: ', targetli);
            // const uls = targetli.querySelectorAll('UL.tree-children');
            // uls.forEach(ul => {
            //     // ul.innerHTML = ``; // reset content to avoid duplication on multiple checks
            // });
            // // buildTree(data, targetli, endpoint, TargetEndpoint, idValue, layerId2, nameValue);
            // buildTree(data, targetli);


            // const childUls = targetli.getElementsByTagName("ul");
            // console.log('childUls: ', childUls);

            // const children = targetli.querySelectorAll('input[type="checkbox"]');
            // // console.log('children', children);

            // children.forEach(cb => {
            //     cb.checked = checkbox.checked;
            //     // console.log('cb', cb);
            //     // cb.dispatchEvent(new Event('change')); // Trigger change event for each child checkbox       
            // });


            // const childUL = document.createElement("ul");
            // childUL.classList.add("tree-children");
            // data.divisions.forEach(dt => {
            //     const idValue = dt[`division_id`];
            //     const nameValue = dt[`division_name`];
            //     const layerId = dt[`HTSectionLayer_id`];  
            //     // console.log(dt);
                  
            //     // const newLi = document.createElement("li");
            //     // newLi.classList.add(`parent-li-circle parent-li-circle-${id}`);
            //     // newLi.innerHTML = generateNewLiHTML(endpoint, TargetEndpoint, idValue, layerId, nameValue);
            //     // childUL.appendChild(newLi);
            // });
            // // li.appendChild(childUL);
            // childUL.style.display = "block";

        } else if (checkbox.classList.contains("feeders")) {
            
            const feederId = checkbox.dataset.id;
            // console.log("feeder_id: ", feederId);
            definExpression = `feeder_id = ${feederId}`;
            circleLayerId = feederId;
            console.log("feeder_id: ", circleLayerId);
            idStarting = 'f';

        } else if (checkbox.classList.contains("stations")) {

            const stationId = checkbox.dataset.id;
            definExpression = `station_id = ${stationId}`;
            circleLayerId = stationId;
            console.log("station_id: ", circleLayerId);
            idStarting = 's';

        } else if (checkbox.classList.contains("sub_divisions")) {

            const sub_divisionId = checkbox.dataset.id;
            definExpression = `sub_division_id = ${sub_divisionId}`;
            circleLayerId = sub_divisionId;
            console.log("sub_division_id: ", circleLayerId);
            idStarting = 'sd';

        } else if (checkbox.classList.contains("divisions")) {

            const divisionId = checkbox.dataset.id;
            definExpression = `division_id = ${divisionId}`;
            circleLayerId = divisionId;
            console.log("division_id: ", circleLayerId);
            idStarting = 'd';

        }

        // console.log("Definition Expression: ", definExpression);

        // Create layer with filter based on layerId
        // Assuming your layer has a field that stores the layer ID
        // Common field names: "LayerID", "LAYER_ID", "Category", "Type", etc.
        const layer = new FeatureLayer({
            url: serviceUrl,
            id: `${idStarting}${circleLayerId}`, // Unique ID for reference
            customId: `${idStarting}${circleLayerId}`, // Custom property for easier reference

            // // Common problematic fields:
            // // Blob, Raster, Geometry, XML, Object
            // // If these exist, '*' may fail.
            // outFields: ['*'], // Specifying all fields

            // Specify fields to return in popups  
            outFields: [
                "HTSectionLayer_id",
                "section_id",
                "feeder_id"
            ],
            definitionExpression: definExpression, // FILTER BY LAYER ID
            title: `Layer ${layerId}`,
            visible: true,
            resultRecordCount: 6000,  // Match your max expected records
            maxRecordCountFactor: 3,   // Allow multiple requests if needed
            // popup
            popupTemplate: {
                title: `Features from Layer ${layerId}`,
                content: [{
                    type: 'fields',
                    fieldInfos: [
                        { fieldName: "HTSectionLayer_id", label: "layerID" },
                        { fieldName: "section_id", label: "sectionID" },
                        { fieldName: "feeder_id", label: "feederID" },
                    ]
                }]
            }

        });
        //  console.log(layer);


        // Wait for layer to load before adding
        await layer.load();
        //   console.log(`Layer ${layerId} loaded successfully`);

        // Store reference
        // activeLayers[circleLayerId] = layer;
        if (checkbox.classList.contains("LayerOnOff")) {
            activeLayers[`${idStarting}${circleLayerId}`] = layer;
        } else if (checkbox.classList.contains("parent-checkbox")) {
            activeLayers[`${idStarting}${circleLayerId}`] = layer;
        } else if (checkbox.classList.contains("feeders")) {
            activeLayers[`${idStarting}${circleLayerId}`] = layer;
        } else if (checkbox.classList.contains("stations")) {
            activeLayers[`${idStarting}${circleLayerId}`] = layer;
        } else if (checkbox.classList.contains("sub_divisions")) {
            activeLayers[`${idStarting}${circleLayerId}`] = layer;
        } else if (checkbox.classList.contains("divisions")) {
            activeLayers[`${idStarting}${circleLayerId}`] = layer;
        }

        console.log("activeLayers: ", activeLayers);    


        // Add to map
        map.add(layer);
        
        //  console.log(`Layer ${layerId} added with filter: LayerID = '${layerId}'`);
        //  console.log("Feature count:", layer.sourceJSON?.features?.length || "Loading...");


        //  Optional: Zoom to layer extent when added
        //  console.log(await layer.queryExtent());
        layer.when(() => {
            const query = layer.createQuery();
            query.returnExtentOnly = true;
            layer.queryExtent(query).then((result) => {
                // console.log("Query Extent Result:", result);
                if (result.extent) {
                    view.goTo(result.extent);
                } else {
                    console.log("No features found for this filter");
                }
            }).catch((error) => {
                console.log("Query Extent Error:", error);
            });
        });

        //  console.log('Checkbox is checked');
        //  console.log(layer);
        //  console.log("layerId: ", layerId);
        //  console.log(geom);  


        // const target = e.target;
        // // console.log("target: ", target);
        // // const checkboxTarget = target.closest('inputinput[type="checkbox"]');
        // // const checkboxTarget = target.nextElementSibling;
        // // console.log("checkboxTarget: ", checkboxTarget);
        // if (target?.checked) {
        //     // console.log("checkboxTarget: ", checkboxTarget);
        //     const li = target.closest('li');
        //     // console.log("li: ", li);
        //     const childCheckboxes = target.closest('li').querySelectorAll('input[type="checkbox"]');
        //     // console.log("childCheckboxes: ", childCheckboxes);
        
        //     childCheckboxes.forEach(cb => {
        //         cb.checked = target.checked;  
        //         // cb.dispatchEvent(new Event('change')); // Trigger change event for each child checkbox
        //     });
        // }



    } else if (!checkbox.checked){

        let id = '';
        if (checkbox.classList.contains("LayerOnOff")) {
            id = `l${layerId}`;
            // id = checkbox.dataset.id;
            console.log(`id for removal: ${id}`);
        } else if (checkbox.classList.contains("parent-checkbox")) {
            id = `c${checkbox.classList[0].at(7)}`;
            console.log(`id for removal: ${id}`);
        } else if (checkbox.classList.contains("feeders")) {
            id = `f${checkbox.dataset.id}`;
            console.log(`id for removal: ${id}`);
        } else if (checkbox.classList.contains("stations")) {
            id = `s${checkbox.dataset.id}`;
            console.log(`id for removal: ${id}`);
        } else if (checkbox.classList.contains("sub_divisions")) {
            id = `sd${checkbox.dataset.id}`;
            console.log(`id for removal: ${id}`);
        } else if (checkbox.classList.contains("divisions")) {
            id = `d${checkbox.dataset.id}`;
            console.log(`id for removal: ${id}`);
        }
        
        // Remove layer using stored reference
        if (activeLayers[id]) {
            const layersToRemove = map.layers.filter(l => l.customId === id);
            map.removeMany(layersToRemove);
            // map.remove(activeLayers[id]);
            delete activeLayers[id]; // Clean up reference
            console.log(`Layer ${id} removed from map`);
        }
        console.log("activeLayers: ", activeLayers); 
    } 

    const target = e.target;
    const li = target.closest('li');
    // console.log("li: ", li);
    const childCheckboxes = target.closest('li').querySelectorAll('input[type="checkbox"]');
    // console.log("childCheckboxes: ", childCheckboxes);
    childCheckboxes.forEach(cb => {
        cb.checked = target.checked;  
        cb.dispatchEvent(new Event('change')); // Trigger change event for each child checkbox
    });

}


function generateNewLiHTML(endpoint, TargetEndpoint, idValue, layerId, nameValue) {

    console.log("endpoint: ", endpoint);

    let newLiHTML = '';

    if (endpoint == 'circles') {
        newLiHTML = `
            <button 
                class="toggle togglebtn togglebtn-circles"
                data-endpoint="${TargetEndpoint}"
                data-id="${idValue}"
                aria-expanded="false"
            >+</button>
            <input 
                type="checkbox" 
                class="circle-${idValue} circle parent-checkbox"
                data-id="${layerId}"
                style="Display: none;"
            >
            <span class="node-label">${nameValue}</span>
        `;
    } else if (endpoint == 'HTLayers') {
        newLiHTML = `
            <input 
                type="checkbox" 
                class="LayerOnOff"
                data-id="${layerId}"
            >
            <span class="node-label">${nameValue}</span>
        `;
    } else {
        newLiHTML = `
            <button 
                class="toggle togglebtn"
                data-endpoint="${TargetEndpoint}"
                data-id="${idValue}"
                aria-expanded="false"
            >+</button>
            <input 
                type="checkbox" 
                class="${endpoint} ${endpoint}-${idValue}-checkbox"
                data-id="${idValue}"
            >
            <span class="node-label">${nameValue}</span>
        `;
    }

    return newLiHTML;
}

async function handleExpandButtonClick(e) {

    const toggleBtn = e.target;
    // console.log("toggleBtn: ", toggleBtn);
    const id = toggleBtn.dataset.id;
    // console.log("id: ", id);
    const cirlce_checkbox = document.querySelector(`.circle-${id }`);
    // console.log("cirlce_checkbox: ", cirlce_checkbox);

    if (!toggleBtn.classList.contains("togglebtn")) return;

    if (toggleBtn.classList.contains("togglebtn-circles")) {
        // console.log('id: ', id);
        // console.log('`circle-${id}`: ', `circle-${id}`);
        // const cirlce_checkbox = document.querySelector(`LayerOnOff`);
        // console.log('cirlce_checkbox: ', cirlce_checkbox);
        cirlce_checkbox.style.display = 'inline';
    };

    const li = toggleBtn.closest("li");

    const expanded = toggleBtn.getAttribute("aria-expanded") === "true";

    // Collapse
    const childULs = li.querySelectorAll("ul");
    if (expanded) {
        if (toggleBtn.classList.contains("togglebtn-circles")) {
            cirlce_checkbox.style.display = 'none';
        }

        toggleBtn.textContent = "+";
        toggleBtn.setAttribute("aria-expanded", "false");
        
        if (childULs) {
            childULs.forEach(ul => {
                ul.style.display = "none";
            });
        }
        return;
    }  else {
        if (childULs) {
            childULs.forEach(ul => {
                ul.style.display = "block";
            });
        }
        // return;
    }

    // Expand
    toggleBtn.textContent = "-";
    toggleBtn.setAttribute("aria-expanded", "true");

    let existingUL = li.querySelector("ul");
    if (existingUL) {
        existingUL.style.display = "block";
        return;
    }

    try {

        const endpoint = toggleBtn.dataset.endpoint;
        // console.log("endpoint: ", endpoint);

        const TargetEndpoint = endpointSelection(endpoint);
        // console.log("TargetEndpoint: ", TargetEndpoint);

        const parentId = toggleBtn.dataset.id || null;

        
        let url = `http://localhost:3000/api/${endpoint}`;
        if (parentId) {
            url += `/${parentId}`;
        }
        // console.log("url: ", url);

        const res = await fetch(url);
        const data = await res.json();



        const childUL = document.createElement("ul");
        childUL.classList.add("tree-children");

        data.forEach((dt, i) => {

            const key = removeLastOccurrence(endpoint, 's');

            let layerId = '';
            let idValue = '';
            let nameValue = '';
            let feederID = '';
            let geom = {};
            let geomText = '';
            let colorCode = '';
            let conductorName = '';


            if (endpoint == "HTLayers") {
                layerId = dt[`HTSectionLayer_id`];
                nameValue = dt[`section_id`];
                feederID = dt['feeder_id'];
                geom = dt['geom'];
                geomText = dt[`geom_text`];
                colorCode = dt[`color_code`];
                conductorName = dt[`conductor_name`];
            } else {
                idValue = dt[`${key}_id`];
                // console.log("idValue: ", idValue);
                nameValue = dt[`${key}_name`];
            }

            const newLi = document.createElement("li");
            
            // console.log(i,);
            newLi.classList.add(`parent-li-circle`, `parent-li-circle-${i+1}`);

            newLi.innerHTML = generateNewLiHTML(endpoint, TargetEndpoint, idValue, layerId, nameValue);

            childUL.appendChild(newLi);
        });

        li.appendChild(childUL);
        childUL.style.display = "block";

    } catch (err) {
        console.error("Error loading data:", err);
    }

    const target = e.target;
    // console.log("target: ", target);
    // const checkboxTarget = target.closest('inputinput[type="checkbox"]');
    const checkboxTarget = target.nextElementSibling;
    // console.log("checkboxTarget: ", checkboxTarget);
    if (checkboxTarget?.checked) {
        // console.log("checkboxTarget: ", checkboxTarget);
        const li = checkboxTarget.closest('li');
        // console.log("li: ", li);
        const childCheckboxes = checkboxTarget.closest('li').querySelectorAll('input[type="checkbox"]');
        // console.log("childCheckboxes: ", childCheckboxes);
    
        childCheckboxes.forEach(cb => {
            cb.checked = checkboxTarget.checked;  
            cb.dispatchEvent(new Event('change')); // Trigger change event for each child checkbox
        });
    }
}

export {
    handleCheckboxChange,
    handleExpandButtonClick,
}