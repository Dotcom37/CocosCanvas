function checkInventory(callback){
    setTimeout(() =>{
        console.log("checking inventory...") 
        callback();
    }, 2000)
}

function takeOrder(callback){
    setTimeout(() =>{
        console.log("taking order....") 
        callback();
    }, 1000)
}

function processPayment(callback){
    setTimeout(() =>{
        console.log("processing payment...") 
        callback();
    }, 3000)
}

function shipOrder(callback){
    setTimeout(() =>{
        console.log("shipping order...") 
        callback();
    }, 1500)
}

function main(){
    checkInventory(() =>{
        takeOrder(() =>{
            processPayment(() =>{
                shipOrder(() =>{
                    console.log("all tasks completed...")
                });
            });
        });
    });
    
    console.log("some other tasks...")
}

main()