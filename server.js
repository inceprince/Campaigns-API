const express = require("express");
const app = express();

const path = require("path");
const fs = require("fs");



app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const root = __dirname;



const folderPath = path.join(root, "data");

if (!fs.existsSync(folderPath)) {
  fs.mkdirSync(folderPath);
}



const filePath = path.join(root, "data", "campaigns.json");

if (!fs.existsSync(filePath)) {
  fs.writeFileSync(filePath, JSON.stringify([]));
}



const readCampaigns = () => {
  const data = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(data);
};



const writeCampaigns = (campaigns) => {
  fs.writeFileSync(filePath, JSON.stringify(campaigns, null, 2));
};

app.listen(8080, () => {
  console.log("Server running on port 8080....");
});



app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "This is  Merchant Campaign API  ",
  });
});



app.get("/campaigns", (req, res) => {
  try {
    const campaigns = readCampaigns();

    res.status(200).json({
      success: true,
      count: campaigns.length,
      data: campaigns,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch campaigns",
    });
  }
});


app.get("/campaigns/:id", (req, res) => {
  try {
    const campaigns = readCampaigns();

    const campaign = campaigns.find(
      (c) => c.id == req.params.id
    );

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: "Campaign not found",
      });
    }

    res.status(200).json({
      success: true,
      data: campaign,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching campaign",
    });
  }
});



app.post("/campaigns", (req, res) => {
  try {
    const campaigns = readCampaigns();

    const {
      merchantName,
      campaignTitle,
      rewardType,
      discount,
      status,
      validTill,
      customerReach,
    } = req.body;

    // VALIDATION

    if (!merchantName || !campaignTitle) {
      return res.status(400).json({
        success: false,
        message: "Merchant name and campaign title are required",
      });
    }

    const newCampaign = {
      id: Date.now(),
      merchantName,
      campaignTitle,
      rewardType: rewardType || "Coupon",
      discount: discount || "10%",
      status: status || "Active",
      validTill: validTill || "2026-12-31",
      customerReach: customerReach || 0,
      createdAt: new Date(),
    };

    campaigns.push(newCampaign);

    writeCampaigns(campaigns);

    res.status(201).json({
      success: true,
      message: "Campaign created successfully",
      data: newCampaign,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create campaign",
    });
  }
});



app.put("/campaigns/:id", (req, res) => {
  try {
    const campaigns = readCampaigns();

    const campaignIndex = campaigns.findIndex(
      (c) => c.id == req.params.id
    );

    if (campaignIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Campaign not found",
      });
    }

    campaigns[campaignIndex] = {
      ...campaigns[campaignIndex],
      ...req.body,
      updatedAt: new Date(),
    };

    writeCampaigns(campaigns);

    res.status(200).json({
      success: true,
      message: "Campaign updated successfully",
      data: campaigns[campaignIndex],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update campaign",
    });
  }
});



app.delete("/campaigns/:id", (req, res) => {
  try {
    const campaigns = readCampaigns();

    const filteredCampaigns = campaigns.filter(
      (c) => c.id != req.params.id
    );

    if (campaigns.length === filteredCampaigns.length) {
      return res.status(404).json({
        success: false,
        message: "Campaign not found",
      });
    }

    writeCampaigns(filteredCampaigns);

    res.status(200).json({
      success: true,
      message: "Campaign deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete campaign",
    });
  }
});


