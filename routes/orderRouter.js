const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Order = require('../models/order');
const authenticate = require('../authenticate');
const cors = require('./cors');
const nodeCCAvenue = require('node-ccavenue');
const ccav = new nodeCCAvenue.Configure({
  merchant_id: process.env.test_merchant_id || process.env.prod_merchant_id,
  working_key: process.env.test_working_key || process.env.prod_working_key
});

const orderRouter = express.Router();
orderRouter.use(bodyParser.json());
orderRouter.route('/checkout')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {

  const { encResp } = req.body;
  const output = ccav.redirectResponseToJson(encResp);

  logger.log(output);
  // The 'output' variable is the CCAvenue Response in JSON Format

  if(output.order_status === 'Failure') {
     // DO YOUR STUFF
    res.writeHead(301,
      {Location: 'http://localhost:4200/cart'}
    );
    res.end();
  } else if (output.order_status === 'Success') {
      // DO YOUR STUFF
      res.writeHead(301,
        {Location: 'http://localhost:4200/'}
      );
      res.end();
    }
});
orderRouter.route('/admin')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Order.find(req.query).populate('user').then((orders) => {
            res.status = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(orders);
        }, (err) => next(err)
        ).catch((err) => next(err));
    })
orderRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Order.findOne({user: req.user._id}).populate('user').then((orders) => {
            res.status = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(orders);
        }, (err) => next(err)
        ).catch((err) => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Order.findOne({user: req.user._id}).then((order) => {
            if (!order) {
                Order.create({"user": req.user._id, "orders": req.body}).then((order) => {
                    res.status = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(order);
                });
            }
            else {
                    order.orders.push(req.body);
                    order.save().then((orders) => {
                    res.status = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(orders);
                }, (err) => next(err))
                .catch((err) => next(err));
            }
        }, (err) => next(err))
            .catch((err) => next(err));
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /orders');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Order.findOneAndDelete({user: req.user._id}).then((resp) => {
            res.status = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(resp);
        }, (err) => next(err))
        .catch((err) => next(err));
    });

    orderRouter.route('/:cartId')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.cors, authenticate.verifyUser, (req,res,next) => {
        Order.findOne({user: req.user._id})
        .then((orders) => {
            if (!orders) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.json({"orders": orders});
            }
            else {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    return res.json({"orders": orders});
            }

        }, (err) => next(err))
        .catch((err) => next(err))
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Order.findOne({user: req.user._id}).then((order) => {
            if(!order) {
                Order.create({"user": req.user._id, "orders": req.body}).then((order) => {
                    res.status = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(order);
                }, (err) => next(err));
            }
            else {
                    order.orders.push(req.body);
                    order.save().then((order) => {
                        res.status = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(order);
                    }, (err) => next(err));
            }
        }, (err) => next(err))
        .catch((err) => next(err));
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /orders/:cartId');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Order.findOne({user: req.user._id}).then((order) => {
            if(order) {
                index = order.orders.indexOf(req.params.cartId);
                if(index >= 0) {
                    order.orders.splice(index, 1);
                    order.save().then((order) => {
                        res.status = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(order);
                    }, (err) => next(err));
                }
                else {
                    err = new Error(req.params.cartId + 'not found');
                err.status = 404;
                return next(err);
                }
            }
            else {
                err = new Error('Order not found');
                err.status = 404;
                return next(err);
            }
        }, (err) => next(err))
        .catch((err) => next(err));
    });
module.exports = orderRouter;