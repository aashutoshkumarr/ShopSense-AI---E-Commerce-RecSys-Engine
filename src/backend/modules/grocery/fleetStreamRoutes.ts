/**
 * ShopSense AI Commerce OS — Quick-Commerce Fleet Live Telemetry (SSE)
 * 
 * Provides real-time Server-Sent Events (SSE) streaming for 10-minute grocery orders,
 * simulating GPS waypoint updates, rider speed, route progress, and doorstep OTP verification.
 */

import { Router, Request, Response } from 'express';

export const fleetStreamRouter = Router();

export interface DeliveryTelemetryTick {
  orderId: string;
  stage: 'packing' | 'quality_check' | 'dispatched' | 'nearby' | 'delivered';
  stageTitle: string;
  stageDescription: string;
  progressPercent: number;
  etaMinutes: number;
  etaSeconds: number;
  rider: {
    name: string;
    phone: string;
    vehicleNumber: string;
    vehicleType: string;
    rating: number;
    currentSpeedKmH: number;
  };
  location: {
    latitude: number;
    longitude: number;
    bearing: number;
    distanceRemainingMeters: number;
  };
  otp: string;
  timestamp: string;
}

// Dark Store base locations in Bangalore
const DARK_STORE_COORDINATES = {
  indiranagar: { lat: 12.9784, lng: 77.6408 },
  koramangala: { lat: 12.9352, lng: 77.6245 },
  whitefield: { lat: 12.9698, lng: 77.7500 }
};

// Customer destination reference coordinate (Indiranagar 100ft Road)
const CUSTOMER_COORDINATE = { lat: 12.9692, lng: 77.6521 };

fleetStreamRouter.get('/stream/:orderId', (req: Request, res: Response) => {
  const orderId = req.params.orderId || 'ord-quick-001';

  // Setup SSE Headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  let tickCount = 0;
  const maxTicks = 12; // Complete simulated lifecycle over ~18 seconds
  const otpCode = '7429';

  const sendEvent = (data: DeliveryTelemetryTick) => {
    res.write(`event: delivery_tick\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  const interval = setInterval(() => {
    tickCount++;
    const fraction = Math.min(tickCount / maxTicks, 1);

    // Waypoint interpolation from Indiranagar store to Customer
    const currentLat = DARK_STORE_COORDINATES.indiranagar.lat + 
      (CUSTOMER_COORDINATE.lat - DARK_STORE_COORDINATES.indiranagar.lat) * fraction;
    const currentLng = DARK_STORE_COORDINATES.indiranagar.lng + 
      (CUSTOMER_COORDINATE.lng - DARK_STORE_COORDINATES.indiranagar.lng) * fraction;

    let stage: DeliveryTelemetryTick['stage'] = 'packing';
    let stageTitle = 'Dark Store Order Assembled';
    let stageDescription = 'Picking fresh organic items from Indiranagar Hub #14';
    let speed = 0;
    let etaMinutes = 9;
    let etaSeconds = 45 - tickCount * 30;

    if (tickCount >= 2 && tickCount < 4) {
      stage = 'quality_check';
      stageTitle = 'Quality & Cold-Chain Tamper Audit';
      stageDescription = 'Items scanned and sealed in temperature-controlled bag';
      speed = 0;
      etaMinutes = 8;
    } else if (tickCount >= 4 && tickCount < 9) {
      stage = 'dispatched';
      stageTitle = 'Rider Dispatched & On the Way';
      stageDescription = 'Arun V. is navigating via 100ft Road on Electric Scooter';
      speed = 32 + (tickCount % 3) * 4;
      etaMinutes = Math.max(3, 8 - (tickCount - 4) * 2);
    } else if (tickCount >= 9 && tickCount < 12) {
      stage = 'nearby';
      stageTitle = 'Rider Arriving at Doorstep';
      stageDescription = 'Arun is 200m away. Please share 4-digit OTP upon arrival';
      speed = 12;
      etaMinutes = 1;
    } else if (tickCount >= 12) {
      stage = 'delivered';
      stageTitle = 'Order Successfully Delivered in 8m 42s!';
      stageDescription = 'OTP verified. Enjoy your fresh groceries!';
      speed = 0;
      etaMinutes = 0;
      etaSeconds = 0;
    }

    const payload: DeliveryTelemetryTick = {
      orderId,
      stage,
      stageTitle,
      stageDescription,
      progressPercent: Math.round(fraction * 100),
      etaMinutes: Math.max(0, etaMinutes),
      etaSeconds: Math.max(0, etaSeconds),
      rider: {
        name: 'Arun V.',
        phone: '+91 98450 12345',
        vehicleNumber: 'KA-03-EQ-8841',
        vehicleType: 'Electric Scooter (Zero-Emission Fleet)',
        rating: 4.94,
        currentSpeedKmH: speed
      },
      location: {
        latitude: Math.round(currentLat * 10000) / 10000,
        longitude: Math.round(currentLng * 10000) / 10000,
        bearing: 135,
        distanceRemainingMeters: Math.max(0, Math.round((1 - fraction) * 2400))
      },
      otp: otpCode,
      timestamp: new Date().toISOString()
    };

    sendEvent(payload);

    if (tickCount >= maxTicks) {
      clearInterval(interval);
      res.write(`event: complete\n`);
      res.write(`data: {"status":"delivered","duration":"8m 42s"}\n\n`);
      res.end();
    }
  }, 1500);

  req.on('close', () => {
    clearInterval(interval);
  });
});
