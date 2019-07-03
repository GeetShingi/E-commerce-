const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Cart = require('../models/cart');
const authenticate = require('../authenticate');
const cors = require('./cors');

const cartRouter = express.Router();
cartRouter.use(bodyParser.json());

cartRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Cart.findOne({user: req.user._id}).populate('user').populate('products').then((cart) => {
            res.status = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(cart);
        }, (err) => next(err)
        ).catch((err) => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Cart.findOne({user: req.user._id}).then((cart) => {
            if (!cart) {
                Cart.create({"user": req.user._id, "products": req.body}).then((cart) => {
                    res.status = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(cart);
                });
            }
            else {
                cart.products.push(req.body);
                cart.save().then((cart) => {
                    res.status = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(cart);
                }, (err) => next(err))
                .catch((err) => next(err));
            }
        }, (err) => next(err))
            .catch((err) => next(err));
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /cart');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Cart.findOneAndDelete({user: req.user._id}).then((resp) => {
            res.status = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(resp);
        }, (err) => next(err))
        .catch((err) => next(err));
    });


cartRouter.route('/:productId')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.cors, authenticate.verifyUser, (req,res,next) => {
        Cart.findOne({user: req.user._id})
        .then((cart) => {
            if (!cart) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.json({"exists": false, "cart": cart});
            }
            else {
                if (cart.products.indexOf(req.params.productId) < 0) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    return res.json({"exists": false, "cart": cart});
                }
                else {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    return res.json({"exists": true, "cart": cart});
                }
            }

        }, (err) => next(err))
        .catch((err) => next(err))
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Cart.findOne({user: req.user._id}).then((cart) => {
            if(!cart) {
                Cart.create({"user": req.user._id, "products": req.params.productId}).then((cart) => {
                    res.status = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(cart);
                }, (err) => next(err));
            }
            else {
                if(cart.products.indexOf(req.params.productId) === -1) {
                    cart.products.push(req.params.productId);
                    cart.save().then((cart) => {
                        res.status = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(cart);
                    }, (err) => next(err));
                }
            }
        }, (err) => next(err))
        .catch((err) => next(err));
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /cart/:productId');
    })
    cartRouter.route('/:cartId/products/:productId')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Cart.findById(req.params.cartId)
    .then((cart) => {
        if (cart != null && cart.products.id(req.params.productId) != null) {
            cart.products.id(req.params.productId).remove();
            cart.save()
            .then((cart) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(cart);
            }, (err) => next(err));
        }
        else if (cart == null) {
            err = new Error('Cart ' + req.params.productId + ' not found');
            err.status = 404;
            return next(err);
        }
        else if (cart.products.id(req.params.productId) == null) {
            err = new Error('Product ' + req.params.productId + ' not found');
            err.status = 404;
            return next(err);            
        }
        else {
            err = new Error('you are not authorized to delete this comment!');
            err.status = 403;
            return next(err);  
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});

module.exports = cartRouter;