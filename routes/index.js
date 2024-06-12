const express = require("express");
const {
  getWebSocketConfigs,
  createWebSocketConfig,
  getWSconfigByCpoIdandCpId
} = require("../controllers/websocketController");
const {
  addChargePoint,
  getAllCps,
  getChargePoint,
  getOcppLogs,
  getChargePointsBySellerId,
  publishChargingPoint,
} = require("../controllers/chargePointController");

const {
  getAuctionListItemsBySellerId,
  closeAuction,
  getAuctionById,
  getAuctionList,
  placeBid,
  endAuction
} = require("../controllers/auctionListController")

const {getBidDetailsById, removeBidder, getBidsByCpoId, makeADeal, confirmDeal, updateBid} = require("../controllers/bidContoller")

const {getCpOperatorById, getCposByCpId} =require("../controllers/cpOperatorController")


const router = express.Router();

router.route("/configs").get(getWebSocketConfigs).post(createWebSocketConfig);
router.route("/configs/:cpId/:cpoId").get(getWSconfigByCpoIdandCpId);

router.route("/charge-point").post(addChargePoint).get(getAllCps);
router.get("/charge-point/:CPID", getChargePoint);
router.post("/charge-point/publish/:cpId", publishChargingPoint);
router.get("/auction/:sellerId/list", getAuctionListItemsBySellerId);
router.get("/auction/end/:auctionId", endAuction);

router.get("/auction/list", getAuctionList);

router.get("/auction/:auctionId", getAuctionById);
router.get("/bid/:bidId", getBidDetailsById);
router.get("/bid/remove/:bidId", removeBidder);
router.patch("/bid/update/:bidId", updateBid);

router.get("/cpo/bids/:cpoId", getBidsByCpoId);
router.get("/cpo/profile/:cpoId", getCpOperatorById);
router.get("/cpo/:cpId", getCposByCpId);

router.get("/bid/makeadeal/:bidId/:days", makeADeal);
router.get("/bid/confirmdeal/:bidId", confirmDeal);


router.get("/auction/close/:auctionId", closeAuction);
router.post("/auction/bid/place", placeBid);

router.get("/charge-point/:sellerId/list", getChargePointsBySellerId);
router.get("/ocpp-logs", getOcppLogs);
module.exports = router;
