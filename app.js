const axios = require('axios');
const { program } = require('commander');

program
  .requiredOption('-u, --url <dominos_url>', 'You must specify your dominos order tracking URL');

program.parse();
options = program.opts();

orderId = ""

function verifyAndExtractOrderId(url){
    if(!url.includes("https://www.dominos.co.uk/pizzatracker/")){
        throw "This doesn't look like a pizza tracker URL"
    }
    reg = url.match(/(id=)([A-Za-z0-9=]+)/)
    if(reg[2]) return reg[2]
    else {
        throw "Could not find a pizza tracker ID in your URL"
    }
}

function statusLookup(orderStatus){
    switch(orderStatus.statusId){
        case 3: 
            return "Delivered"
        case 5:
            return "Baking"
        case 8: 
            return "Sitting on a shelf"
        case 9: 
            return "Out for delivery with "+orderStatus.driverName
        default:
            return "statusId unknown ("+orderStatus.statusId+") - it's probably in prep"
    }
}

async function getOrderStatus(){
    const response = await axios.get('https://www.dominos.co.uk/pizzaTracker/getOrderDetails?id='+orderId);
    return response.data
}
async function update(){
    orderStatus = await getOrderStatus()
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write("Order status: "+statusLookup(orderStatus)+" ");
}

async function main(){
    try{
        orderId = verifyAndExtractOrderId(options.url)
    } catch(e) {
        console.log(e)
        return
    }
    i = await getOrderStatus()
    console.log("Hello "+i.customerName)
    update()
    setInterval(update, 10000)
}

main()