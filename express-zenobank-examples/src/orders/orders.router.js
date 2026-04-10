const { Router } = require('express');
const asyncHandler = require('../lib/async-handler');
const ordersService = require('./orders.service');
const { createOrderSchema, toOrderResponse } = require('./orders.dto');

const router = Router();

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const dto = createOrderSchema.parse(req.body);
    const order = await ordersService.createOrder(dto);
    res.status(201).json(toOrderResponse(order));
  }),
);

router.get('/:id', (req, res) => {
  const order = ordersService.getOrder(req.params.id);
  res.json(toOrderResponse(order));
});

module.exports = router;
