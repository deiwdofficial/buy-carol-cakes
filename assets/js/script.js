const
q = (el)=> document.querySelector(el),
qAll = (el)=> document.querySelectorAll(el)


let cakesCandies;
let saleIndex;
let priceCart;
let cart = [];
let teste = 0;

async function loadPosts(){
    let req = await fetch('assets/js/cakes&Candies.json')
    cakesCandies = await req.json()

    cakesCandies.map( async (obj, index)=>{
        let saleWidget = q('.sale-widget').cloneNode(true)
        saleWidget.setAttribute('data-index', index)

        obj.price.push(0)

        saleWidget.querySelector('.sale--img img').src = obj.img
        saleWidget.querySelector('.sale--price span').innerHTML = obj.price[0].toLocaleString('pt-br',{style:'currency',currency:'BRL'})
        saleWidget.querySelector('.sale--name').innerHTML = obj.name
        saleWidget.querySelector('.sale--desc').innerHTML = obj.description
        
        saleWidget.querySelector('a').addEventListener('click', (link)=>{
            link.preventDefault()
            
            q('body').style.overflow = 'hidden'

            let saleWindow = q('.saleWindowBody')
            saleIndex = link.target.closest('.sale-widget').getAttribute('data-index')

            saleWindow.querySelector('.img--saleWindow img').src = cakesCandies[saleIndex].img
            saleWindow.querySelector('.inf--saleWindow h1').innerHTML = cakesCandies[saleIndex].name
            saleWindow.querySelector('.inf--saleWindow p').innerHTML = cakesCandies[saleIndex].description
            saleWindow.querySelector('.price--saleWindow span').innerHTML = cakesCandies[saleIndex].price[0].toLocaleString('pt-br',{style:'currency',currency:'BRL'})
            priceCart = cakesCandies[saleIndex].price

            q('.select--weight span.selected').classList.remove('selected')
            saleWindow.querySelectorAll('.select--weight span').forEach((el, i)=>{

                if(i == 0){ el.classList.add('selected') }

                if(i == 3){el.innerHTML = 'Custom'}

                if(el.innerHTML == 'Custom'){}
                else {el.innerHTML = `${cakesCandies[saleIndex].weight[i]}kg`}

                el.addEventListener('click', (i)=>{
                    q('.select--weight span.selected').classList.remove('selected')
                    el.classList.add('selected')

                    teste = i.target.getAttribute('data-key')

                    let weightSelected = q('.select--weight span.selected').getAttribute('data-key')

                    if(weightSelected <= 2){
                        saleWindow.querySelector('.price--saleWindow span').innerHTML = cakesCandies[saleIndex].price[weightSelected].toLocaleString('pt-br',{style:'currency',currency:'BRL'})
                    } else {
                        saleWindow.querySelector('.price--saleWindow span').innerHTML = 'R$ Bargain'
                    }     
                })

            })

            saleWindow.querySelector('.select--filling span').innerHTML = `Without filling`
            saleWindow.querySelector('.options--filling').innerHTML = `<li class="selected">Without filling</li>`
            
            for(let i in cakesCandies[saleIndex].filling){
                saleWindow.querySelector('.options--filling')
                .innerHTML += `<li>${cakesCandies[saleIndex].filling[i]}</li>`

                saleWindow.querySelectorAll('.options--filling li').forEach((item)=>{
                    item.addEventListener('click', (el)=>{
                        saleWindow.querySelector('.select--filling span').innerHTML = el.target.innerHTML

                        q('.options--filling li.selected').classList.remove('selected')
                        item.classList.add('selected')

                        closeAreaFilling()
                    })
                }) 
            }

            saleWindow.querySelector('.close--saleWindow').addEventListener('click', ()=>{
                q('.saleWindowArea').classList.remove('open')
                qAll('section').forEach((e)=>{
                    e.classList.remove('blur')
                })
                q('body').style.overflow = ''

                closeAreaCustom()
                closeAreaFilling()
            })

            qAll('section').forEach((e)=>{
                e.classList.add('blur')
            })
            q('.saleWindowArea').classList.add('open')
        })
        

        q('.post-area').append(saleWidget)
    })
}

loadPosts()

let custom_btn = q('.select--weight span:nth-child(4)')
let custom_input = q('.boxCustom')
let filling_btn = q('.select--filling span')

function closeAreaCustom() {
    qAll('.custom, .boxCustom').forEach((el)=> el.classList.remove('show'))
    custom_input.value = '' 
}
function valueFilter_Custom() {
    let boxCustom_value = parseInt(q('.boxCustom').value)

    if(boxCustom_value <= 3){
        custom_btn.innerHTML = "Custom"
        closeAreaCustom()
    }
    else{ closeAreaCustom() }
}

custom_btn.addEventListener('click', ()=>{
    if(custom_input.classList.contains('show')){ valueFilter_Custom() } 
    else{ 
        closeAreaFilling()
        qAll('.custom, .boxCustom').forEach((el)=> el.classList.add('show'))
        custom_input.focus((el)=> el.select() ) 
    }
})
custom_input.addEventListener('keydown', (el)=>{
    if(el.keyCode == 13){ valueFilter_Custom() }
})
custom_input.addEventListener('input', ()=>{
    if(custom_input.value.length > 2){
        custom_input.value = custom_input.value.slice(0, 2)
    }
    custom_btn.innerHTML =  `${custom_input.value}kg`
})


function closeAreaFilling() {
    filling_btn.classList.remove('move')
    q('.options--filling').style.display = 'none'
}

filling_btn.addEventListener('click', (el)=>{
    if(el.target.classList.contains('move')){
        closeAreaFilling()
    } else {
        closeAreaCustom()
        el.target.classList.add('move')
        q('.options--filling').style.display = 'block'
    }
})

q('.close--options').addEventListener('click', ()=>{
    closeAreaCustom()
    closeAreaFilling()
})

let keyWeight;
q('.add--saleWindow').addEventListener('click', ()=>{
    keyWeight = parseInt( q('.select--weight span.selected').getAttribute('data-key') )
    let valueWeight = q('.select--weight span.selected').innerHTML
    let valueFilling = q('.select--filling span').innerHTML

    let identifier = `${cakesCandies[saleIndex].id}@${valueWeight}@${valueFilling}`

    let identifier_Key = cart.findIndex((obj)=> obj.identifier == identifier )
    
    if(identifier_Key > -1){
        if(cart[identifier_Key].price > 0){
            cart[identifier_Key].price += priceCart[keyWeight]
        }
        cart[identifier_Key].quant++
    } else {
        cart.push({
            identifier,
            id: cakesCandies[saleIndex].id,
            weight_key: keyWeight,
            weight: valueWeight,
            filling: valueFilling,
            price: priceCart[keyWeight],
            quant: 1
        })
    }

    q('.saleWindowArea').classList.remove('open')
    qAll('section').forEach((e)=>{
        e.classList.remove('blur')
    })
    q('body').style.overflow = ''

    closeAreaCustom()
    closeAreaFilling()

    updateCart()
})

let cart_modal = q('.cart_list-items')
q('.cart-icon').addEventListener('click', ()=> {
    
    if(cart.length > 0){

        if(cart_modal.classList.contains('open')) { 
            cart_modal.classList.remove('open') 
        } else { 
            cart_modal.classList.add('open') 
        }
        
    }    
})

let price_result = ``;

function updateCart(){
    cart_modal.querySelector('.body_cart').innerHTML = ''
    
    let
    subtotal = 0,
    discount = 0,
    total = 0;

    let quantility = 0;

    if(cart.length > 0){
        
        for(let i in cart){
            let cartIndex = cakesCandies.find((item)=> item.id == cart[i].id )

            subtotal += cart[i].price
            discount = subtotal * 0.06
            total = subtotal - discount

            quantility += cart[i].quant

            q('.cart-icon i').innerHTML = quantility

            let cartWidget = q('.models .cart-widget').cloneNode(true)
            cartWidget.setAttribute('style', `order: -${i}`)
            
            cartWidget.querySelector('.img--cart img').src = cartIndex.img
            cartWidget.querySelector('.inf--cart h1').innerHTML = cartIndex.name
            cartWidget.querySelector('.flavors--cart span').innerHTML = cart[i].filling
            cartWidget.querySelector('.weight--cart span').innerHTML = cart[i].weight
            cartWidget.querySelector('.quantility--cart span').innerHTML = cart[i].quant
            cartWidget.querySelector('.price--cart span').innerHTML = cart[i].price.toLocaleString('pt-br',{style:'currency',currency:'BRL'})
            
            cartWidget.querySelector('.delete-item').addEventListener('click',(el)=>{

                let k = cart[i].weight_key
                let price_reduce = cart[i].quant--
                let price = cart[i].price - cartIndex.price[k]
                let key = cart.findIndex((e)=> e.price == cart[i].price )

                if(key > -1){ cart[key].price = price }

                if(price_reduce < 2){ cart.splice(i, 1) }
 
                updateCart()
            })
            
            cart_modal.querySelector('.subtotal--cart span').innerHTML = subtotal.toLocaleString('pt-br',{style:'currency',currency:'BRL'})
            cart_modal.querySelector('.discount--cart span').innerHTML = discount.toLocaleString('pt-br',{style:'currency',currency:'BRL'})
            cart_modal.querySelector('.total--cart span').innerHTML = total.toLocaleString('pt-br',{style:'currency',currency:'BRL'})
        

            price_result = `______________________ %0A
_Subtotal:  ${ subtotal.toLocaleString('pt-br',{style:'currency',currency:'BRL'}) }_%0A
_Desconto (6%):  ${ discount.toLocaleString('pt-br',{style:'currency',currency:'BRL'}) }_%0A%0A

Total: *${ total.toLocaleString('pt-br',{style:'currency',currency:'BRL'}) }*
`

            cart_modal.querySelector('.body_cart').appendChild(cartWidget)
        }
        
    } else {
        cart_modal.classList.remove('open')
        q('.cart-icon i').innerHTML = quantility
    }
}

cart_modal.querySelector('a').addEventListener('click',(link)=>{
    link.preventDefault()
    cart_modal.classList.remove('open') 
})

cart_modal.querySelector('.checkout-btn').addEventListener('click',(link)=>{
    let wp = ``
    let category = "Cake"
    let initial = `%F0%9F%98%8A Hello, this is my list`
    let whatsappUrl
    cart.map((el)=>{
        let cartIndex = cakesCandies.find((item)=> item.id == el.id )
        
        wp += `
*- ${category}*
Name:  ${cartIndex.name} 
Filling:  ${el.filling}
Unit:  ${el.quant}
Weight:  ${el.weight}        
`

        let encode = encodeURI(wp)
        whatsappUrl = `http://api.whatsapp.com/send?phone=5516997224790&text=${initial}%0A${encode}%0A${price_result}`

        setTimeout(()=>window.open(whatsappUrl, "_blank"), 300)
    })
        
    //let encode = encodeURI(TEXT)
    //let whatsappUrl = `http://api.whatsapp.com/send?phone=PHONE-NUMBER&text=YOUR-TEXT`
    
})
