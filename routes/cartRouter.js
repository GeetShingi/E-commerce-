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
    .post(authenticate.verifyUser, (req, res, next) => {
        Cart.findOne({user: req.user._id}).then((cart) => {
            if (!cart) {
                Cart.create({"user": req.user._id, "products": req.body}).then((cart) => {
                    res.status = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(cart);
                });
            }
            else {
                for(var i=0; i<req.body.length; i++) {
                    if (cart.products.indexOf(req.body[i]._id) === -1) {
                        cart.products.push(req.body[i]._id);
                    }
                }
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
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Cart.findOne({user: req.user._id}).then((cart) => {
            if(cart) {
                index = cart.products.indexOf(req.params.productId);
                if(index >= 0) {
                    cart.products.splice(index, 1);
                    products.save().then((cart) => {
                        res.status = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(cart);
                    }, (err) => next(err));
                }
                else {
                    err = new Error(req.params.productId + 'not found');
                err.status = 404;
                return next(err);
                }
            }
            else {
                err = new Error('Cart not found');
                err.status = 404;
                return next(err);
            }
        }, (err) => next(err))
        .catch((err) => next(err));
    });


module.exports = cartRouter;