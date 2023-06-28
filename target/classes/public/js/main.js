function login() {
    document.getElementById('default').innerHTML = `<p>You are not logged in!</p>`;

    const form = document.getElementById("login-form");
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const data = new FormData(event.target);
        const email = data.get("email");
        const body = {
            "email": email
        };

        const options = {
            method: 'POST',
            body: JSON.stringify(body)
        };

        fetch('/people', options)
            .then(response => {
                if (response.status === 200) {
                    return response.json()
                }
                $('#error').text("Invalid email.");
            })
            .then(data => {
                sessionStorage.setItem("email", data.email);
                sessionStorage.setItem("id", data.id);
                router.navigateTo('expenses');
            })
            .catch(err => { })
    })
}

function expenses() {
    const id = sessionStorage.getItem("id");
    const email = sessionStorage.getItem("email");
    defaultContent(email);

    const options = {
        method: 'GET',
    }
    fetch(`/expenses/person/${id}`, options)
        .then(response => response.json())
        .then(data => {

            let total = 0;
            data.forEach(element => {
                total += element.nettAmount
            });
            const template = document.getElementById("expenses-template").innerText;
            const compiledFunction = Handlebars.compile(template);
            const viewModel = {
                expenses: data,
                expensetotal: total,
            }

            document.getElementById('app').innerHTML = compiledFunction(viewModel);
        })

}

function newExpense() {
    const id = sessionStorage.getItem("id");
    const email = sessionStorage.getItem("email");
    defaultContent(email);

    const form = document.getElementById("newexpense-form");
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const data = new FormData(event.target);
        const description = data.get("description");
        const date = data.get("date");
        const amount = data.get("amount");
        const body = {
            "description": description,
            "date": date,
            "amount": amount,
            "personId": id,
        };

        const options = {
            method: 'POST',
            body: JSON.stringify(body)
        };

        fetch('/expenses', options)
            .then(response => {
                if (response.status === 200) {
                    return response.json()
                }
                $('#error').text("Invalid email.");
            })
            .then(data => {
                console.log(data);
                router.navigateTo('expenses');
            })
            .catch(err => { })
    })
}





function paymentRequest_sent() {
    const id = sessionStorage.getItem("id");
    const email = sessionStorage.getItem("email");
    defaultContent(email);

    const options = {
        method: 'GET',
    }
    fetch(`/paymentrequests/sent/${id}`, options)
        .then(response => response.json())
        .then(data => {
            findAllRequests(data);
        })
}



function paymentRequest_recieved(){
    const id = sessionStorage.getItem("id");
    const email = sessionStorage.getItem("email");
    defaultContent(email);

    const options = {
        method: 'GET',
    }
    fetch(`/paymentrequests/received/${id}`, options)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            findAllRequestsRecieved(data);
        })
}

function createNewExpense(data){
    const id = sessionStorage.getItem("id");
    const date = data.date;
    const amount = data.amount;

    const options = {
        method: 'GET',
    }
    fetch(`/expenses/${data.expenseId}`,options)
    .then(response => response.json())
    .then(data => {
        const body = {
            "description": data.description,
            "date": date,
            "amount": amount,
            "personId": id,
        };

        const options = {
            method: 'POST',
            body: JSON.stringify(body)
        };

        fetch('/expenses', options)
            .then(response => {
                if (response.status === 200) {
                    return response.json()
                }
                $('#error').text("Invalid email.");
            })
            .then(data => {
                console.log(data);
            })
            .catch(err => { })
    })
}


function submitPayment(data){

    const options = {
        method: 'POST',
        body: JSON.stringify(data)
    };

    fetch(`/paymentrequests`,options)
    .then(response =>  {
        if (response.status === 201) {
            console.log(response.json());
        }
        $('#error').text("Invalid email.");
    })
}



function findAllRequests(data) {
    const options = {
        method: 'GET',
    }
    let total = 0;
    const allRequests = [];
    data.forEach(element => {
        let getPersonId = element.toPersonId;
        let getDate = element.date;
        let getExpense = element.expenseId;
        total += element.amount;
        fetch(`/people/${getPersonId}`, options)
            .then(response => response.json())
            .then(data => {
                let personName = data.email.split("@")[0];
                fetch(`/expenses/${getExpense}`, options)
                    .then(response => response.json())
                    .then(data => {
                        allRequests.push({
                            name: personName,
                            description: data.description,
                            dueDate: data.date,
                            amount: element.amount,
                        })
                    })
            });
    });

    const viewModel = {
        payments: allRequests,
        grandtotal: total,
    }

    setTimeout(function () {
        const template = document.getElementById("paymentrequests_received-template").innerText;
        const compiledFunction = Handlebars.compile(template);
        document.getElementById('app').innerHTML = compiledFunction(viewModel);
    }, 100);
}


function findAllRequestsRecieved(data) {
    const options = {
        method: 'GET',
    }
    let total = 0;
    const allRequests = [];
    data.forEach(element => {
        let getPersonId = element.toPersonId;
        let getPaid = element.paid;
        let getExpense = element.expenseId;
        total += element.amount;
        fetch(`/people/${getPersonId}`, options)
            .then(response => response.json())
            .then(data => {
                let personName = data.email.split("@")[0];
                fetch(`/expenses/${getExpense}`, options)
                    .then(response => response.json())
                    .then(data => {
                        allRequests.push({
                            name: personName,
                            description: data.description,
                            dueDate: data.date,
                            amount: element.amount,
                            paid : getPaid,
                            paymentId : element.id,
                        })
                    })
            });
    })
    const viewModel = {
        payments: allRequests,
        grandtotal: total,
    }

    console.log(viewModel);
    setTimeout(function () {
        const template = document.getElementById("paymentrequests_received-template").innerText;
        const compiledFunction = Handlebars.compile(template);
        document.getElementById('app').innerHTML = compiledFunction(viewModel);
    }, 100);
}

function onSubmitAction(paymentId){

    const options = {
        method: 'GET',
    }

    const date = new Date();

    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();

    let today = `${day}/${month}/${year}`

    fetch(`/paymentrequests/${paymentId}`,options)
        .then(response => response.json())
        .then(data => {
            updateData = {
                "id": data.id,
                "expenseId": data.expenseId,
                "fromPersonId": data.fromPersonId,
                "toPersonId": data.toPersonId,
                "date": today,
                "amount": data.amount,
                "paid": true,
              }
            submitPayment(updateData);
            createNewExpense(updateData);
            router.navigateTo("paymentrequests/received");
        })
}

function defaultContent(email) {
    const template = document.getElementById("defualt-template").innerText;
    const compiledFunction = Handlebars.compile(template);
    const viewModel = {
        email: email,
        username: email.split("@")[0],
    }
    document.getElementById('default').innerHTML = compiledFunction(viewModel);
}


function addPrevRequestsData(){

    const addAllPayReq = [];
    fetch(`people/${element.toPersonId}`, {
        method: 'GET',
    })
        .then(response => response.json())
        .then(data => {
            console.log(data)
            addAllPayReq.push({
                name: data.email.split("@")[0],
                date: element.date,
                isPaid: element.isPaid,
                amount: element.amount,
            })
        })
}

function paymentrequests(expenseId) {

    const personId = sessionStorage.getItem("id");

    expenseId = location.hash.substring(location.hash.lastIndexOf('=') + 1);

    const options = {
               method: 'GET',
               };
    fetch(`/paymentrequests/sent/${personId}`, options)
        .then(response => response.json())
        .then(data => {
            PaymentRequestsSent = {
                RequestsSent: data,
            }


    findToPersonEmail(PaymentRequestsSent.RequestsSent, options);
    console.log(PaymentRequestsSent.RequestsSent);

    fetch(`/expenses/${expenseId}`, options)
        .then(response => response.json())
        .then(dataExpense => {
            const totalAmount = calculateAmount(PaymentRequestsSent.RequestsSent);
            RequestsSent = {
                date: dataExpense.date,
                amount: dataExpense.amount,
                description: dataExpense.description,
                grandtotal: totalAmount,
                previousreq: PaymentRequestsSent.RequestsSent,
            }
            executeTemplate('paymentrequestwithId-template', RequestsSent, 'app');
            payment(RequestsSent.previousreq,expenseId);
        });
    });
}

function executeTemplate(templates, data, elementToGet){
    const template = document.getElementById(templates).innerText;
    const compiledFunction = Handlebars.compile(template);
    document.getElementById(elementToGet).innerHTML = compiledFunction(data);
}

function payment(RequestsSent,expenseId){
    const personId = sessionStorage.getItem("id");

    const form = document.getElementById("payrequest-form");
    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const data = new FormData(event.target);
        const word = data.get("email");
        const amount = parseInt(data.get("amount"));
        const date = data.get("date");


        const toPersonId = getToPersonID(RequestsSent, word.split("@")[0]);

        const options = {
            method: 'POST',
            body: `{"expenseId": "${expenseId}",
            "fromPersonId": "${personId}",
            "toPersonId": "${toPersonId}",
            "date":"${date}",
            "amount": "${amount}"}`
            }

        fetch(`/paymentrequests`, options)
            .then(response => response.json())
            .then(data => {
                data = {
                    id: data.id,
                    expenseId: data.expenseId,
                    fromPersonId: data.fromPersonId,
                    toPersonId: data.toPersonId,
                    date: data.date,
                    amount:data.amount,
                    isPaid: data.isPaid,
                }
            setTimeout(function (){

                            router.navigateTo("/paymentrequests?id=" + data.expenseId);
                        }, 100);

        })
    })
}

function getToPersonID(eachUsername, newUsername){
    let toPersonId = 0;
    for(let person of eachUsername){
        if(person.username === newUsername){
            toPersonId += person.toPersonId;
        }
    };
    return toPersonId;
}

function calculateAmount(data){
    let amount = 0;
    for (let x of data) {
       amount += x.amount;
    }
    return amount;
}

function dateConverter(formDate){
    const d = new Date(formDate);
    const month = d.getMonth()+1;
    let day = d.getDate();
    if (day <= 9){
        day = "0" + d.getDate();
    }
    return day + "/" + month + "/" + d.getFullYear()
}



function findToPersonEmail(datawe, options){
    let i = 0;
    for(let id of datawe){
        fetch(`/people/${id.toPersonId}`, options)
            .then(response => response.json())
            .then(data => {
                datawe[i]["name"] = data.email.split("@")[0];
                i+=1;
        });
    };
}


window.addEventListener('load', () => {
    const app = $('#app');

    const loginTemplate = Handlebars.compile($('#login-template').html());
    const expensesTemplate = Handlebars.compile($('#expenses-template').html());
    const paymentRequestsSentTemplate = Handlebars.compile($('#paymentrequests_sent-template').html());
    const paymentRequestsRecievedTemplate = Handlebars.compile($('#paymentrequests_received-template').html());
    const newExpenseTemplate = Handlebars.compile($('#newexpense-template').html());
    const paymentRequestWithIdTemplate = Handlebars.compile($('#paymentrequestwithId-template').html());

    router = new Router({
        mode: 'hash',
        root: '/',
        page404: (path) => {
            router.navigateTo('login');
        }
    });

    router.add('login', async () => {
        html = loginTemplate();
        app.html(html);
        login();
    })

    router.add('expenses', async () => {
        html = expensesTemplate();
        app.html(html);
        expenses();
    })

    router.add('newexpense', async () => {
        html = newExpenseTemplate();
        app.html(html);
        newExpense();
    })

    router.add('paymentrequests/sent', async () => {
        html = paymentRequestsSentTemplate();
        app.html(html);
        paymentRequest_sent();
    })

    router.add('paymentrequests/received', async () => {
        html = paymentRequestsRecievedTemplate();
        app.html(html);
        paymentRequest_recieved();
    })

    router.add('paymentrequests', async () => {
        var expenseId = $('#paymentrequest').data('value');
        html = paymentRequestWithIdTemplate();
        app.html(html);
        paymentrequests(expenseId)
    })

    router.addUriListener();

    $('a').on('click', (event) => {
        event.preventDefault();
        const target = $(event.target);
        const href = target.attr('href');
        const path = href.substring(href.lastIndexOf('/'));
        router.navigateTo(path);
    });
    router.navigateTo('/a');
});



