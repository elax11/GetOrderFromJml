plus = 'Plus'
minus = 'Minus'

window.onload = function () {
    loadStateFromLocalStorage();
    displayDetails(State.orders);
}

function initState() {
    State = {
        orders: []
    };
}

function clearState() {
    initState();
    localStorage.clear();
    var none = document.getElementById('order');
    none.innerText = '';
}

function whenFileIsOpened(files) {
    clearState();
    let promises = [];
    for (let file of files) {
        let filePromise = new Promise(function (resolve, reject) {
            let reader = new FileReader();
            reader.onload = function () {
                resolve(reader.result);
            }
            reader.readAsText(file);
        });
        promises.push(filePromise);
    }
    Promise.all(promises).then(fileContents => {
        for (let content of fileContents) {
            let order = getOrderFromXml(content);
            State.orders.push(order);
        }
        displayDetails(State.orders);
        saveStateToLocalStorage();
    });

}

function saveStateToLocalStorage() {
    var json = JSON.stringify(State);
    localStorage.setItem('State', json);
}

function loadStateFromLocalStorage() {
    try {
        var json = localStorage.getItem('State');
        State = JSON.parse(json);
    } catch (ex) {
        initState();
    }

    if (!State || !Array.isArray(State.orders))
        initState();
}

function getOrderFromXml(rawXml) {
    let parser = new DOMParser();
    let xmlDoc = parser.parseFromString(rawXml, "text/xml");
    let materials = xmlDoc.getElementsByTagName("material");
    let rawdetails = xmlDoc.getElementsByTagName("detail");
    let details = [];
    for (let i = 0; i < rawdetails.length; i++) {
        details[i] = {
            amount: Number(rawdetails[i].getAttribute("amount")),
            width: rawdetails[i].getAttribute("width"),
            height: rawdetails[i].getAttribute("height"),
            description: rawdetails[i].getAttribute("description"),
            remainingAmount: Number(rawdetails[i].getAttribute("amount"))
        }
    }
    return {
        materialName: materials[0].getAttribute("name"),
        details: details
    }
}

function displayDetails(orders) {
    let root = document.getElementById("order");
    for (let i = 0; i < orders.length; i++) {
        root.appendChild(h2(orders[i].materialName));
        root.appendChild(table(orders[i].details, i));
    }
}

function h2(text) {
    let h2 = document.createElement('h2');
    h2.innerHTML = text;
    return h2;
}

function table(details, numberOfOrder) {
    let table = document.createElement('table');
    table.setAttribute('class', 'table table-striped')
    let thead = document.createElement('thead');
    let row = document.createElement('tr');
    row.appendChild(getHeaderCell("Description"));
    row.appendChild(getHeaderCell("Width"));
    row.appendChild(getHeaderCell("Height"));
    row.appendChild(getHeaderCell("AM"));
    row.appendChild(getHeaderCell("R-AM"));
    row.appendChild(getHeaderCell("Plus one"));
    row.appendChild(getHeaderCell("Minus one"));
    thead.appendChild(row);
    table.appendChild(thead);
    let tbody = document.createElement('tbody');
    for (let i = 0; i < details.length; i++) {
        tbody.appendChild(getDetailRow(details[i], numberOfOrder, i));
    }
    table.appendChild(tbody);

    return table;
}

function getHeaderCell(text) {
    let cell = document.createElement('th');
    cell.innerHTML = text;
    // cell.setAttribute('scope', 'col');
    return cell;
}

function getDetailRow(details, numberOfOrder, numberOfElement) {
    let row = document.createElement('tr');
    row.appendChild(getDetailCell(details.description));
    row.appendChild(getDetailCell(details.width));
    row.appendChild(getDetailCell(details.height));
    row.appendChild(getDetailCell(details.amount));
    row.appendChild(getDetailCell(details.remainingAmount, 'Table:' + numberOfOrder + 'amount:' + numberOfElement));
    row.appendChild(getButtonCell(plus, numberOfElement, numberOfOrder));
    row.appendChild(getButtonCell(minus, numberOfElement, numberOfOrder));
    // row.setAttribute('scope', 'col');
    return row;
}

function getDetailCell(detail, numberOfElement) {
    let cell = document.createElement('td');
    cell.innerHTML = detail;
    if (numberOfElement !== undefined) {
        cell.setAttribute('class', numberOfElement);
    }
    return cell;
}

function getButtonCell(text, numberOfElement, numberOfTable) {
    let cell = document.createElement('td');
    let button = document.createElement("button");
    button.setAttribute('class', 'Table:' + numberOfTable + 'button' + text + ':' + numberOfElement + ' btn btn-dark btn-lg');
    button.innerText = text;
    let detail = State.orders[numberOfTable].details[numberOfElement];
    if ((text === plus && detail.remainingAmount >= detail.amount) || (text === minus && detail.remainingAmount <= 0))
        button.disabled = true;
    button.onclick = function (e) {
        if (text == "Plus")
            detail.remainingAmount += 1;
        else
            detail.remainingAmount -= 1;
        if (detail.remainingAmount < detail.amount && detail.remainingAmount > 0) {
            setDisabledState(false, numberOfTable, numberOfElement, plus);
            setDisabledState(false, numberOfTable, numberOfElement, minus);
        }
        else if (detail.remainingAmount >= detail.amount) {
            setDisabledState(true, numberOfTable, numberOfElement, plus);
            setDisabledState(false, numberOfTable, numberOfElement, minus);
        }
        else {
            setDisabledState(false, numberOfTable, numberOfElement, plus);
            setDisabledState(true, numberOfTable, numberOfElement, minus);
        }
        let myClass = 'Table:' + numberOfTable + 'amount:' + numberOfElement;
        let remainingAmountElement = document.getElementsByClassName(myClass);
        remainingAmountElement[0].innerHTML = detail.remainingAmount;
        saveStateToLocalStorage();
    }
    cell.appendChild(button);
    return cell;
}

function setDisabledState(state, numberOfTable, numberOfElement, plusMinus) {
    let buttonElement = document.getElementsByClassName('Table:' + numberOfTable + 'button' + plusMinus + ':' + numberOfElement);
    buttonElement[0].disabled = state;
}