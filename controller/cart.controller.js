const Cart = require("../models/cart.model");
const Product = require("../models/product.model");
const ownerFilter = (req) => req.user ? { user: req.user.id } : { guestId: req.headers["x-guest-id"] };
const priceOf = p => p.discountPrice !== null && p.discountPrice < p.price ? p.discountPrice : p.price;

const getCart = async (req,res) => {
  try {
    const filter=ownerFilter(req);
    if(!filter.user && !filter.guestId) return res.status(400).json({message:"Guest ID is required"});
    const cart=await Cart.findOne(filter).populate("items.product","name price discountPrice images sku stock");
    res.json({cart:cart||{items:[]}});
  } catch(error){res.status(500).json({message:"Failed to get cart",error:error.message});}
};
const addItem = async (req,res) => {
  try {
    const {product,quantity=1}=req.body;
    const qty=Number(quantity);
    if(!product || !Number.isInteger(qty) || qty<1) return res.status(400).json({message:"Product and valid quantity are required"});
    const owner=ownerFilter(req); if(!owner.user&&!owner.guestId) return res.status(400).json({message:"Guest ID is required"});
    const itemProduct=await Product.findOne({_id:product,isDeleted:false,isActive:true});
    if(!itemProduct) return res.status(404).json({message:"Product not found or inactive"});
    let cart=await Cart.findOne(owner); if(!cart) cart=await Cart.create({...owner,items:[]});
    const existing=cart.items.find(i=>i.product.toString()===product.toString());
    const next=(existing?existing.quantity:0)+qty;
    if(next>itemProduct.stock) return res.status(400).json({message:"Insufficient stock"});
    const price=priceOf(itemProduct);
    if(existing){existing.quantity=next;existing.price=price;} else cart.items.push({product,quantity:qty,price});
    await cart.save();
    res.json({message:"Item added to cart",cart});
  } catch(error){res.status(500).json({message:"Failed to add item",error:error.message});}
};
const updateItem = async (req,res) => {
  try {
    const qty=Number(req.body.quantity); if(!Number.isInteger(qty)||qty<1) return res.status(400).json({message:"Quantity must be at least 1"});
    const cart=await Cart.findOne(ownerFilter(req)); if(!cart) return res.status(404).json({message:"Cart not found"});
    const item=cart.items.id(req.params.itemId); if(!item) return res.status(404).json({message:"Cart item not found"});
    const product=await Product.findById(item.product); if(!product||product.stock<qty) return res.status(400).json({message:"Insufficient stock"});
    item.quantity=qty; item.price=priceOf(product); await cart.save(); res.json({message:"Cart item updated",cart});
  } catch(error){res.status(500).json({message:"Failed to update cart item",error:error.message});}
};
const removeItem=async(req,res)=>{try{const cart=await Cart.findOne(ownerFilter(req));if(!cart)return res.status(404).json({message:"Cart not found"});const item=cart.items.id(req.params.itemId);if(!item)return res.status(404).json({message:"Cart item not found"});item.deleteOne();await cart.save();res.json({message:"Item removed",cart});}catch(error){res.status(500).json({message:"Failed to remove cart item",error:error.message});}};
const clearCart=async(req,res)=>{try{const cart=await Cart.findOne(ownerFilter(req));if(!cart)return res.json({message:"Cart cleared",cart:{items:[]}});cart.items=[];await cart.save();res.json({message:"Cart cleared",cart});}catch(error){res.status(500).json({message:"Failed to clear cart",error:error.message});}};
module.exports={getCart,addItem,updateItem,removeItem,clearCart};
