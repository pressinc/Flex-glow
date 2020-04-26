function formatBigNumber(int) {
  return int.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function insertPointValue(ele) {
  var currencyCostString = ele.getAttribute("data-loyal-currency-cost");
  var regex = /[^\d]/g;
  var currencyCost = currencyCostString.replace(regex, "") / 100;
  var points = currencyCost * pointRulePercent;

  if (ele.getAttribute("data-loyal-round") == "up") {
    points = Math.ceil(points);
  } else {
    points = Math.floor(points);
  }

  ele.querySelectorAll("[data-loyal-target]").forEach(function(target) {
    if (target.getAttribute("data-loyal-target") == "point-value-location") {
      target.innerHTML = formatBigNumber(points);
    }
  });
}

function pointRedemptionValidation() {
  var redemptionPointValue = document.getElementById("redemption-point-value");

  if (redemptionPointValue) {
    var value = redemptionPointValue.value;
    var regex = /[^\d]/;
    if (value.match(regex) != null) {
      return false;
    } else {
      var points = parseInt(value);
      var targetNodes = document.querySelectorAll("[data-loyal-target]");
      var targets = Array.prototype.slice.call(targetNodes);
      var balanceText = "0";

      targets.find(function(ele) {
        var target = ele.getAttribute("data-loyal-target");
        if (target == "balance") {
          return (balanceText = ele.textContent);
        }
      });

      var balanceNum = balanceText.replace(/[^\d]/g, "");
      var balance = parseInt(balanceNum);

      var maxRedeemable = document.getElementById("redemption-max-points").value;
       // decimal currencies payout in decimal amounts by default
      maxRedeemable *= 1.0;

      var maxValue = Math.min(balance, maxRedeemable);
      return 0 < points && points <= maxValue;
    }
  }
}

function updateRedemptionForm() {
  var shownPointsEle = document.getElementById("shown-point-value");
  if (shownPointsEle) {
    var points = shownPointsEle.value;
    var redemptionPointValue = document.getElementById(
      "redemption-point-value"
    );
    if (redemptionPointValue) {
      redemptionPointValue.value = points;
    }

    if (!pointRedemptionValidation()) {
      shownPointsEle.classList.add("invalid");
    } else {
      shownPointsEle.classList.remove("invalid");
    }
  }
}

var pointRulePointValue = sessionStorage.getItem("customerPointRulePointValue");
var pointRuleCurrencyValue = sessionStorage.getItem("customerPointRuleCurrencyValue");
var pointRulePercent = null;

function htmlRedirectInput() {
  var input = document.createElement("input");
  input.type = "text";
  input.setAttribute("name", "html_redirect");
  input.value = "true";
  return input;
}

function buildForm(action) {
  var virtualForm = document.getElementById("point-redemption-form");
  if (virtualForm) {
    var inputs = Array.from(virtualForm.getElementsByTagName("input"));

    var form = document.createElement("form");
    form.method = "post";
    form.action = action;
    form.classList.add("hide");

    inputs.forEach(function(input, ind) {
      form.appendChild(input.cloneNode());
    });

    form.appendChild(htmlRedirectInput());
    return form;
  } else {
    return null;
  }
}

function submitForm(form) {
  document.body.appendChild(form);
  form.submit();
}

function submitRedemptionForm() {
  updateRedemptionForm();

  if (pointRedemptionValidation()) {
    if (
      (widgetRedemptionButton = document.getElementById(
        "widget-redemption-button"
      ))
    ) {
      widgetRedemptionButton.setAttribute("disabled", true);
      animateButton(
        "widget-redemption-button",
        'ポイント使用中'
      );
    }

    updateDisplayedDiscount();
    var form = buildForm("/apps/loyalty/redeem");

    if (form) {
      submitForm(form);
    }
  }
}

function updateDisplayedDiscount() {
  var pointValue = document.getElementById("shown-point-value");
  sessionStorage.setItem("appliedDiscount", pointValue.value);
  displayDiscount(pointValue.value.toString());
}

function submitResetForm() {
  var widgetResetButton = document.getElementById("widget-reset-button");
  if (widgetResetButton) {
    widgetResetButton.setAttribute("disabled", true);
    animateButton(
      "widget-reset-button",
      'リセット中'
    );
  }

  sessionStorage.removeItem("appliedDiscount");
  displayDiscount("0");

  var form = buildForm("/apps/loyalty/reset");

  if (form) {
    submitForm(form);
  }
}

function animateButton(buttonId, startingText) {
  var button = document.getElementById(buttonId);
  if (button) {
    button.innerText = startingText;

    function animation() {
      if (button.innerText.includes("...")) {
        button.innerText = startingText;
      } else {
        button.innerText = button.innerText + ".";
      }

      setTimeout(animation, 500);
    }

    animation();
  }
}

function expandWidget() {
  var widget = document.getElementById("widget-container");
  if (widget) {
    widget.classList.remove("hide");
  }

  var minWidget = document.getElementById("widget-minimized");
  if (minWidget) {
    minWidget.classList.add("hide");
  }
}

function hideWidget() {
  localStorage.setItem("easyPointsWidgetHidden", true);

  var widget = document.getElementById("widget-container");
  if (widget) {
    widget.classList.add("hide");
  }

  var minWidget = document.getElementById("widget-minimized");
  if (minWidget) {
    minWidget.classList.remove("hide");
  }
}

function showWidget() {
  localStorage.removeItem("easyPointsWidgetHidden");
  expandWidget();
}

function updateDiscountInfo() {
  var shownPointValue = document.getElementById("shown-point-value");
  if (shownPointValue) {
    shownPointValue.setAttribute("disabled", true);
  }

  var widgetResetButton = document.getElementById("widget-reset-button");
  if (widgetResetButton) {
    widgetResetButton.classList.remove("hide");
  }

  var widgetRedemptionButton = document.getElementById(
    "widget-redemption-button"
  );

  if (widgetRedemptionButton) {
    widgetRedemptionButton.classList.add("hide");
  }
}

function displayDiscount(value) {
  var currencyValue = "¥";
  currencyValue += formatBigNumber(value / 1.0).toString();

  sessionStorage.setItem("appliedDiscount", value);
  sessionStorage.setItem("appliedDiscountCurrency", currencyValue);

  displayAppliedDiscount();
}

function displayAppliedDiscount() {
  var appliedDiscount = sessionStorage.getItem("appliedDiscount");

  var appliedDiscountCurrency = sessionStorage.getItem(
    "appliedDiscountCurrency"
  );

  eles = document.querySelectorAll(
    'span[data-loyal-target="applied-discount"]'
  );

  eles.forEach(function(ele) {
    ele.textContent = appliedDiscountCurrency;
  });

  var shownPointValue = document.getElementById("shown-point-value");
  if (shownPointValue) {
    var valueNum = appliedDiscount.toString().replace(/[^\d]/g, "");
    var valueInt = parseInt(valueNum);
    shownPointValue.value = valueInt;
  }
}

function updatePointValueTargets() {
  pointRulePercent = pointRulePointValue / pointRuleCurrencyValue;
  var spanNodes = document.getElementsByTagName("span");
  var spans = Array.prototype.slice.call(spanNodes);

  spans.forEach(function(ele) {
    if (ele.getAttribute("data-loyal-target") == "point-value") {
      insertPointValue(ele);
    }
  });
}

function updateLoyaltyTargets() {
  var targetNodes = document.querySelectorAll("[data-loyal-target]");
  var targets = Array.prototype.slice.call(targetNodes);
  var pointBalance = localStorage.getItem("pointBalance");

  targets.find(function(ele) {
    var target = ele.getAttribute("data-loyal-target");

    if (target == "shop-point-rule-currency-value") {
      pointRuleCurrencyValue = pointRuleCurrencyValue || ele.value;
    } else if (target == "shop-point-rule-point-value") {
      pointRulePointValue = pointRulePointValue || ele.value;
    } else if (pointBalance && target == "balance") {
      ele.textContent = formatBigNumber(pointBalance);
    }
  });

  if (pointRulePointValue && pointRuleCurrencyValue) {
    updatePointValueTargets();
  }
}

window.addEventListener("load", function() {
  var widgetHidden = localStorage.getItem("easyPointsWidgetHidden");
  var cartItemCountEle = document.getElementById("cart-item_count");

  var appliedDiscount = sessionStorage.getItem("appliedDiscount");

  if (appliedDiscount && parseInt(appliedDiscount) > 0) {
    displayAppliedDiscount();
    updateDiscountInfo();
  }

  if (
    widgetHidden != "true" &&
    cartItemCountEle &&
    cartItemCountEle.value > 0
  ) {
    if (window.screen.width > 1200 && window.screen.height > 1300) {
      expandWidget();
    }
  }

  updateLoyaltyTargets();

  var redemptionButton = document.getElementById("redemption_button");
  if (redemptionButton) {
    redemptionButton.addEventListener("click", submitRedemptionForm);
  }

  if (
    (widgetRedemptionButton = document.getElementById(
      "widget-redemption-button"
    ))
  ) {
    widgetRedemptionButton.addEventListener("click", submitRedemptionForm);
  }

  var widgetResetButton = document.getElementById("widget-reset-button");
  if (widgetResetButton) {
    widgetResetButton.addEventListener("click", submitResetForm);
  }

  var widgetCloseButton = document.getElementById("widget-close-btn");
  if (widgetCloseButton) {
    widgetCloseButton.addEventListener("click", hideWidget);
  }

  var showWidgetButton = document.getElementById("widget-minimized");
  if (showWidgetButton) {
    showWidgetButton.addEventListener("click", showWidget);
  }

  var shownPointValue = document.getElementById("shown-point-value");
  if (shownPointValue) {
    shownPointValue.addEventListener("change", updateRedemptionForm);

    shownPointValue.addEventListener("focus", function() {
      shownPointValue.setAttribute("placeholder", "");
    });

    shownPointValue.addEventListener("blur", function() {
      shownPointValue.setAttribute("placeholder", "0");
    });
  }
});
