/* ----------------------------------------------- jQuery(document).ready -----------------------------------------------*/

var products_in_order = []; // array of items to exclude from search results

var delay;

jQuery(document).ready(function () {

    config_business = 'Team Medical Supplies';
    config_url = 'https://www.teammed.com.au/shop/';
    config_joomla_url = 'https://www.teammed.com.au/';

    setTimeout(function () {
        window.scrollTo(0, 0);
    }, 0);
    jQuery(document).delegate('*[data-toggle="lightbox"]:not([data-gallery="navigateTo"])', 'click', function (event) {
        event.preventDefault();
        jQuery(this).ekkoLightbox();
    });
    if ("ontouchstart" in document.documentElement) {
        var viewportmeta = document.querySelector('meta[name="viewport"]');
        if (viewportmeta) {
            viewportmeta.content = 'width=device-width, minimum-scale=1.0, maximum-scale=1.0, initial-scale=1.0';
            document.body.addEventListener('gesturestart', function () {
                viewportmeta.content = 'width=device-width, minimum-scale=0.25, maximum-scale=1.6';
            }, false);
        }
        jQuery(".hasSubMenu").attr("href", "javascript:;");
    }


    // Get user session data
    ccData = false;
    jQuery.ajax({
        type: "GET",
        url: config_url + "includes/files/session.php",
        cache: false,
        success: function(data){
            if(data) {
                ccData = jQuery.parseJSON(data);
            }
            //console.log('ccData:'+ccData);
        }
    });

    jQuery(document).on('mouseover', '.rowHighlight', function () {
        window.curColor = jQuery(this).css('background');
        jQuery(this).css('background', '#FF9');
    });

    jQuery(document).on('mouseout', '.rowHighlight', function () {
        jQuery(this).css('background', curColor);
    });

    jQuery(document).on('click', '.rowHighlight', function () {

        // Return False if Statement
        if (jQuery(this).data('product') == 'statement') {
            return false;
        }

        var sku = jQuery(this).data('product');

        // Launch Product Detail Page
        window.location = config_url + '?page=product_detail&product_code=' + sku;
    });

    jQuery(document).on('mouseover', '.rowHighlightOrders', function () {
        window.curColor = jQuery(this).css('background');
        jQuery(this).css('background', '#FF9');
    });

    jQuery(document).on('mouseout', '.rowHighlightOrders', function () {
        jQuery(this).css('background', curColor);
    });

    jQuery(document).on('click', '.rowHighlightOrders', function () {

        runLoader('Loading Order. Please Wait');

        // Return False if Statement
        var transactionId = jQuery(this).data('transaction');

        // Launch Product Detail Page
        if(ccData.session) {
            transData = {"soh_id": transactionId, "pagename": "order_drilldown.html", "session": ccData.session};
            jQuery('#whiteBackgroundHolder').load(config_url + 'includes/modules/order_detail.php', transData);
        }
    });

    jQuery(document).on('click', '.requestEta', function () {
        // Variables
        var detailsStringArray = jQuery(this).data('details');
        var detailArray = detailsStringArray.split('|');
        var debtId = detailArray[0];
        var sku = detailArray[1];
        var ref = detailArray[2];
        // Set json
        jsonString = {"sku": sku, 'ref': ref};
        jQuery.getJSON(config_url + 'includes/modules/send_eta_request.php', jsonString, function (data) {
            if (data.RETURN == 'SUCCESS') {
                fancyBoxPopup('<p>E.T.A Request has been successfully sent to '+config_business+'.<br />You will get a response soon.</p>', true);
            }
        });
    });

    jQuery(document).on('click', '.closeWindow', function () {
        parent.jQuery.fancybox.close();
    });

    jQuery(document).on('keydown', '#purchaseHistoryInput', function (e) {
        var keyword = jQuery(this).val();
        keyword = keyword.toLowerCase();
        var limit = 10;
        var count = 0;
        jQuery('#purchaseTable > tbody  > tr').each(function () {
            var showRow = false;
            var rowSet = jQuery(this);
            jQuery(this).children('td').each(function () {

                var cellVal = jQuery(this).html();
                cellVal = cellVal.toLowerCase();
                var setMatch = cellVal.match(keyword, 'g');

                if (setMatch) {
                    showRow = true;
                }
            });
            if (showRow == true) {
                rowSet.show();
            } else {
                rowSet.hide();
            }
        });
    });

    jQuery(document).on('click', '.checkoutButton', function () {
        window.location = config_url + '?page=view_cart';
    });

    window.prevHtml = '';

    jQuery(document).on('mouseover', '.comingSoon', function () {
        prevHtml = jQuery(this).html();
        jQuery(this).html('Coming Soon');
    });

    jQuery(document).on('mouseout', '.comingSoon', function () {
        jQuery(this).html(prevHtml);
    });

    // Script for Updating the Inovoices Page
    jQuery(document).on('change', '.orderUpdate', function () {
        // Determine all the checkboxes that are checked
        var totalValue = 0; // Get the Total Value of the Selected Items
        var orderValue = 0; // Default Setting for Order Values
        var eftContent = ''; // HTML content for EFT Section
        var chequeContent = ''; // HTML content for EFT Section

        if(ccData.session) {
            // Loop all the Current Items and Check for Value
            // Loop all the Current Items and Check for Value
            jQuery('.orderUpdate').each(function () {
                var orderValue = parseFloat(jQuery(this).data('value'));
                var orderDate = jQuery(this).data('date');
                var invoiceNum = jQuery(this).val();
                isChecked = jQuery(this).is(':checked'); // Get the Checked/Unchecked boolean Value
                if (isChecked) {
                    totalValue += orderValue; // Do Count
                    orderValue = orderValue.toFixed(2);
                    eftContent += '<tr><td>' + invoiceNum + '</td><td>Invoice</td><td>' + orderDate + '</td><td align="right">$' + orderValue + '</td></tr>';
                    chequeContent += '<tr><td>' + invoiceNum + '</td><td>Invoice</td><td>' + orderDate + '</td><td align="right">$' + orderValue + '</td></tr>';
                }
            });
            totalValue = totalValue.toFixed(2);

            // Do the EFT Content
            if (eftContent != '') {
                eftContent += '<tr><td><strong>Total:</strong></td><td align="right" colspan="3"><strong>$' + totalValue + '</strong></td></tr>';
                eftHeader = '<p>You have selected the following invoices for EFT payment:</p><div id="no-more-tables"><table class="table table-bordered table-striped table-condensed cf">';
                eftHeader += '<thead class="cf"><tr><th>Trans #</th><th>Type</th><th>Date</th><th>Total Outstanding</th></tr></thead>';

                eftFooter = '</table></div><div class="well well-sm">';
                eftFooter += 'Please EFT <strong>$' + totalValue + '</strong> with reference <strong>' + ccData.DEBT_ID + '</strong> to :<br /><br />';
                eftFooter += 'Team Medical Supplies<br />';
                eftFooter += 'BSB 063-104 Account 10437452<br /><br />';
                eftFooter += 'Please note that this does not constitute payment.<br /><br />';
                eftFooter += 'We will process your remittance when funds are in our account.';
                eftFooter += '</div>';
                jQuery('.eftContent').html(eftHeader + eftContent + eftFooter);
            }

            if (chequeContent != '') {
                chequeContent += '<tr><td><strong>Total:</strong></td><td align="right" colspan="3"><strong>$' + totalValue + '</strong></td></tr>';
                chequeHeader = '<p>You have selected the following invoices for cheque:</p><div id="no-more-tables"><table class="table table-bordered table-striped table-condensed cf">';
                chequeHeader += '<thead class="cf"><tr><th>Trans #</th><th>Type</th><th>Date</th><th>Total Outstanding</th></tr></thead>';

                chequeFooter = '</table></div><div class="well well-sm">';
                chequeFooter += 'Please mail your cheque of <strong>$' + totalValue + '</strong> with this remittance to :<br /><br />';
                chequeFooter += 'Team Medical Supplies<br />';
                chequeFooter += 'PO Box 6245<br />';
                chequeFooter += 'Dural DC NSW 2158<br /><br />';
                chequeFooter += 'Please note that this does not constitute payment.<br />';
                chequeFooter += 'We will process your remittance when funds are in our account.';
                chequeFooter += '</div>';
                jQuery('.chequeContent').html(chequeHeader + chequeContent + chequeFooter);
            }

            // Display the Total Selected Value
            if (totalValue > 0) {
                var totalhtml = '<p>Current Payment Total: <strong>$' + totalValue + '</strong></p>';
                jQuery('.selectBottom').fadeIn(300);
                if (jQuery('.onlinePaymentType').val() == '') {
                    jQuery('.onlinePaymentType').val('Credit Card');
                    jQuery(".onlinePaymentType").trigger("change");
                }
            } else {
                var totalhtml = '<p>Current Payment Total: <strong>$0</strong></p>';
                jQuery('.selectBottom').fadeOut(300);
                jQuery('.creditCardDisplay').fadeOut(300);
                jQuery('.chequeDisplay').fadeOut(300);
                jQuery('.onlinePaymentType').val('');
            }
            jQuery('.addTotal').html(totalhtml);
            jQuery('.addTotalBottom').html(totalhtml);
        }

    });

    // Toggle Credit Card Display on Online Payment Page
    jQuery('.onlinePaymentType').change(function () {
        jQuery('.creditCardDisplay').fadeOut(300);
        jQuery('.eftDisplay').fadeOut(300);
        jQuery('.chequeDisplay').fadeOut(300);
        var selectedVal = jQuery(this).val();
        if (selectedVal == 'Credit Card') {
            jQuery('.creditCardDisplay').fadeIn(300);
            jQuery("html, body").animate({scrollTop: (jQuery("#paymentSelect").offset().top - 100)}, 1000);
        } else if (selectedVal == 'EFT') {
            jQuery('.eftDisplay').fadeIn(300);
            jQuery("html, body").animate({scrollTop: (jQuery("#paymentSelect").offset().top - 100)}, 1000);
        } else if (selectedVal == 'Cheque') {
            jQuery('.chequeDisplay').fadeIn(300);
            jQuery("html, body").animate({scrollTop: (jQuery("#paymentSelect").offset().top - 100)}, 1000);
        } else {
            jQuery('.creditCardDisplay').fadeOut(300);
        }
    });

    // Send Remittance
    jQuery('#sendRemittance').click(function () {
        var debtor = jQuery('#debtor').val();
        var contact = jQuery('#contact').val();
        var email = jQuery('#email').val();
        var phone = jQuery('#phone').val();
        var error = '';

        if (debtor == '') {
            error += "Please Enter your Debtor Name.\n";
        }
        if (contact == '') {
            error += "Please Enter your Contact Name.\n";
        }
        if (email == '') {
            error += "Please Enter your Email.\n";
        }
        if (phone == '') {
            error += "Please Enter your Phone.\n";
        }

        if (error != '') {
            alert(error);
            return false;
        } else {
            // Send the Remittance Email

            // Loop all the Current Items and Check for Value
            var count = 0;
            var totalValue = 0;
            orderString = new Object();
            jQuery('.orderUpdate').each(function () {
                var orderValue = parseFloat(jQuery(this).data('value'));
                var orderDate = jQuery(this).data('date');
                var invoiceNum = jQuery(this).val();
                isChecked = jQuery(this).is(':checked'); // Get the Checked/Unchecked boolean Value
                if (isChecked) {
                    orderString[count] = {"invoice": invoiceNum, "date": orderDate, "value": orderValue};
                    totalValue += orderValue; // Do Count
                    count++;
                }
            });
            jsonString = {
                "debtor": debtor,
                'contact': contact,
                'email': email,
                'phone': phone,
                'orders': orderString,
                'total': totalValue,
                'type': 'eft'
            };
            jQuery.getJSON(config_url + 'includes/modules/send_remittance.php', jsonString, function (data) {
                if (data.RETURN == 'SUCCESS') {
                    jQuery('.eftDisplay').fadeOut(300);
                    fancyBoxPopup('<p>Thank you.<br />A Copy of your Remittance has been sent to ' + email + '</p>', true);
                    jQuery('.onlinePaymentType').val('');
                }
            });
        }
    });

    // Send Remittance
    jQuery('#printCheque').click(function () {
        var debtor = jQuery('#debtorCheque').val();
        var contact = jQuery('#contactCheque').val();
        var phone = jQuery('#phoneCheque').val();
        var email = jQuery('#emailCheque').val();
        var error = '';

        if (debtor == '') {
            error += "Please Enter your Debtor Name.\n";
        }
        if (contact == '') {
            error += "Please Enter your Contact Name.\n";
        }
        if (email == '') {
            error += "Please Enter your Email.\n";
        }
        if (phone == '') {
            error += "Please Enter your Phone.\n";
        }

        if (error != '') {
            alert(error);
            return false;
        } else {
            // Loop all the Current Items and Check for Value
            var count = 0;
            var totalValue = 0;
            var orderString = new Object();
            jQuery('.orderUpdate').each(function () {
                var orderValue = parseFloat(jQuery(this).data('value'));
                var orderDate = jQuery(this).data('date');
                var invoiceNum = jQuery(this).val();
                isChecked = jQuery(this).is(':checked'); // Get the Checked/Unchecked boolean Value
                if (isChecked) {
                    orderString[count] = {"invoice": invoiceNum, "date": orderDate, "value": orderValue};
                    totalValue += orderValue; // Do Count
                    count++;
                }
            });
            jsonString = {
                "debtor": debtor,
                'contact': contact,
                'phone': phone,
                'email': email,
                'orders': orderString,
                'total': totalValue,
                'type': 'cheque'
            };
            jQuery.getJSON(config_url + 'includes/modules/send_remittance.php', jsonString, function (data) {
                if (data.RETURN == 'SUCCESS') {
                    jQuery('.chequeDisplay').fadeOut(300);
                    fancyBoxPopup('<p>Thank you.<br />A Copy of your Remittance has been sent</p>', true);
                    jQuery('.onlinePaymentType').val('');
                }
            });
        }
    });

    // Add to Template
    jQuery('.addTemplate').click(function () {
        sku = jQuery(this).data('sku');
        templateSelect = jQuery('.templateSelect').val();
        if (templateSelect == '') {
            alert('Select a Template!');
            return false;
        }
        jsonString = {'template': templateSelect, 'sku': sku, 'action': 'add'};
        jQuery.getJSON(config_url + 'includes/files/set_template.php', jsonString, function (data) {
            if (data.RETURN == 'SUCCESS') {
                fancyBoxPopup(data.MESSAGE, true);
                templateSelect = jQuery('.templateSelect').val('');
            }
        });
    });

    if (jQuery("#purchaseTable").length > 0) {
        jQuery("#purchaseTable").tablesorter();
    }

    jQuery('#mobileMenu').click(function () {
        jQuery('#navPopup').fadeIn(100);
        jQuery('.fader_overlay').fadeIn(100);
    });

    jQuery('.fader_overlay').click(function () {
        jQuery('#navPopup').fadeOut(100);
        jQuery('.fader_overlay').fadeOut(100);
    });

    // Scroll Top
	/*
	 jQuery(window).scroll(function() {
	 var getOffset = window.pageYOffset;
	 if(getOffset > 170) {
	 jQuery(".headerFixed").addClass("shadow");
	 } else {
	 jQuery(".headerFixed").removeClass("shadow");
	 }
	 });
	 */

    jQuery('#address_type').change(function () {

        var type = jQuery(this).val();

        if (type == 'business') {

            jQuery('.business_address_display').show();

        } else {

            jQuery('.business_address_display').hide();

        }

        if (type == 'residential') {

            jQuery('.residential_address_display').show();

        } else {

            jQuery('.residential_address_display').hide();

        }

        fixSearchHeights();

    });

    jQuery("li.dropdown-submenu > a").on("click", function () {
        jQuery("li.dropdown-submenu").removeClass("open");
        if (jQuery(this).parent("li.dropdown-submenu").hasClass("in-use")) {
            jQuery(this).parents("li.dropdown-submenu").addClass("open");
            jQuery(this).parent("li.dropdown-submenu").removeClass("open");
            jQuery(this).parent("li.dropdown-submenu").removeClass("in-use");
            jQuery(this).siblings('ul.dropdown-menu').children("li.dropdown-submenu").removeClass("open");
            jQuery(this).siblings('ul.dropdown-menu').children("li.dropdown-submenu").removeClass("in-use");
        } else {
            jQuery(this).parents("li.dropdown-submenu").addClass("open");
            jQuery(this).parents("li.dropdown-submenu").addClass("in-use");
        }
        return false;
    });
    jQuery('.new-form').click(function () {

        // show new form popup

        var msg = '<form name="createTemplate" id="createTemplate" method="post" action=""><input type="hidden" name="formAction" value="true"/><div class="form-group"><label for="templateName">Template Name</label><input type="text" class="form-control form-name" id="templateName" name="templateName" value="" placeholder="Name of Template"/></div><a href="javascript:;" class="btn btn-warning create-form" id="templateName">Add Template</a></form>';

        fancyBoxPopup(msg, false);

    });

    jQuery(document).on('click', '.create-form', function () {

        var form = document.querySelector('.form-name');

        var form_val = form.value;

        if (form_val.trim() == '') {

            // empty form name

            form.setAttribute('placeholder', 'Order Form needs a name!');

            form.setAttribute('style', 'border:solid 1px red;');

            setTimeout(function () {

                form.setAttribute('placeholder', 'Name of New Order Form');

                form.setAttribute('style', '');

            }, 5000);

        } else {

            // good to go

            window.location = config_url + '?page=order_form_template&new_form=' + encodeURI(form_val);

        }

    });

    // jQuery(document).on('keyup', '.order-form-search', function() {
    jQuery(document).on('click', '#manager_order_link', function () {

        var input_val = jQuery('#order-form-search').val();

        var order_results = document.querySelector('.order-search-results');

        var order_loader = document.querySelector('.order-loader');

        var results_array = [];

        // remove any existing child nodes

        while (order_results.firstChild) {

            order_results.removeChild(order_results.firstChild);

        }

        fixSearchHeights();

        if (input_val.length > 2) {

            // run the ajax search

            var json_string = {"search_val": input_val, 'debtor': ccData.DEBT_ID};

            if (products_in_order.length > 0) {

                json_string.inorder = products_in_order;

            }

            order_loader.style.display = 'block';

            clearTimeout(delay);

            delay = setTimeout(function () {

                jQuery.getJSON(config_url+'includes/files/order-form-search.php', json_string, function (data) {

                    order_loader.style.display = 'none';

                    if (data.Error || data.length < 1) {

                        var el = document.createElement('li');

                        el.innerHTML = 'No results found';

                        order_results.appendChild(el);

                    } else {

                        for (var i = 0; i < data.length; i++) {

                            var even = parseFloat(i) ? !(i % 2) : 0;

                            var product = data[i];

                            var el = document.createElement('li');

                            if (results_array.indexOf(product.code) != -1) {

                                continue; // is already in array

                            }

                            // set the data attributes
                            el.setAttribute('class', 'list-group-item');
                            el.setAttribute('data-code', product.code);

                            el.setAttribute('data-default', product.default);

                            el.setAttribute('data-desc', product.desc);

                            el.setAttribute('data-price', product.price);

                            el.setAttribute('data-history', product.history);

                            var content = '<span class="order-description"><strong>' + product.desc + '</strong>&nbsp;&nbsp;<i>' + product.unit + '</i></span><br />' + product.code;

                            if (product.last_purchased.trim() != '(0)' && product.last_purchased != 'N/A') {

                                content += "<br /><span class='order-last-purchased'>Last Purchased: " + product.last_purchased + "</span>";

                            }

                            content += "<div class='order-add'><a href='javascript:;' data-addcode='" + product.code + "' class='add-to-order-form' title='Add Product to Order Sheet'>Add +</a></div>";

                            el.innerHTML = content;

                            if (even || i == 0) {

                                //el.setAttribute('style', 'background:#f5f5f5;');

                            }

                            order_results.appendChild(el);

                            results_array.push(product.code);
                        }
                        jQuery('.sort_select').trigger('change');
                    }
                    fixSearchHeights();
                });

            }, 500);

        } else {
            alert('Search should be minimum 3 chars');
        }

    });


    jQuery(document).on('click', '.add-to-order-form', function (e) {

        e.preventDefault();

        e.stopPropagation();

        var code = jQuery(this).data('addcode');

        add_to_order(code);

        remove_inactive();

    });

    jQuery(document).on('click', '.remove-from-order-form', function (e) {

        e.preventDefault();

        e.stopPropagation();

        var code = jQuery(this).data('removecode');

        remove_from_order(code);

        remove_inactive();

    });

    jQuery(document).on('click', '.save-order-sheet', function (e) {

        e.preventDefault();

        e.stopPropagation();

        // get order sheet name and product codes

        var form_name = document.querySelector('.form-name');

        var json_obj = {
            'pagename': 'order_form_submit.html',
            'DEBT_ID': ccData.DEBT_ID,
            'orderform_name': form_name.value,
            "userinfo": ccData.session
        };

        var form_products = document.querySelectorAll('.order-codes');

        for (var i = 0; i < form_products.length; i++) {

            var product_code = form_products[i].value;

            json_obj['stk_id' + (i + 1)] = product_code;

        }

        // show popup

        var msg = '<div class="order-save-popup">Saving Your Order Form. Please Wait.<br /><br /><img src="img/ajax-loader.gif" border="0" width="16"></div>';

        fancyBoxPopup(msg);

        // make cc request

        var return_orderform = function (ret) {

            var order_save = document.querySelector('.order-save-popup');

            if (ret.ErrorReturn) {

                order_save.innerHTML = 'Sorry, an error has occured. Please try saving again.';

            } else {

                order_save.innerHTML = "Order Form has been saved.<br /><br /><a href=\"javascript:window.location='"+config_url+"?page=order_form_template&orderform_name=" + encodeURI(form_name.value) + "';\" class=\"btn btn-warning\">Close</a>";

                add_inactive();

            }

        };

        clearConnectCall('clearconnect', json_obj, return_orderform); // Make Request to ClearConnect

    });

    jQuery(document).on('click', '.remove-order-sheet', function (e) {

        e.preventDefault();

        e.stopPropagation();

        var form_name = jQuery(this).data('form');

        var msg = '<div class="order-save-popup">Are you sure you want to remove the Order Sheet?<br /><br /><a href="javascript:;" class="btn btn-warning confirm-remove" data-form="' + form_name + '">Yes, Remove It</a>&nbsp;&nbsp;&nbsp;<a href="javascript:;" class="btn btn-warning" data-dismiss="modal">No, Keep it</a></div>';

        fancyBoxPopup(msg, true);


    });

    jQuery(document).on('click', '.confirm-remove', function (e) {

        e.preventDefault();

        e.stopPropagation();

        var form_name = jQuery(this).data('form');

        var json_obj = {
            'pagename': 'order_form_submit.html',
            'DEBT_ID': ccData.DEBT_ID,
            'orderform_name': form_name,
            'stk_id1': 'DELETE',
            "userinfo": ccData.session
        };

        var return_order_delete = function (ret) {

            if (ret.ErrorReturn) {

                order_save.innerHTML = 'Sorry, an error has occured. Please try removing again.';

            } else {

                location.reload();

            }

        };

        clearConnectCall('clearconnect', json_obj, return_order_delete); // Make Request to ClearConnect

    });
    jQuery('.viewed-pdf').click(function () {

        var ele = jQuery(this);

        var id = ele.data('id');

        jsonString = {"id": id};

        jQuery.getJSON(config_url+'includes/files/set-pdf-viewed.php', jsonString, function (data) {

            if (data.RETURN == 'SUCCESS') {

                ele.attr('class', 'viewed-pdf pdfLogo-viewed iconButton');

            }

        });
    });
    jQuery('#trackorder').click(function () {
        jQuery('#morelink').slideToggle();
    });


	/*// login page enter key action
	 if (document.getElementById('login')) {
	 jQuery(document).keypress(function (e) {
	 if (e.which == "13") {
	 loginRequest();
	 }
	 });
	 }*/
    if(location.href == config_joomla_url+"contact-us"){
        jQuery("body").addClass("contactpage");
    }
    jQuery(".contactpage .contact .contact-form").insertBefore(jQuery(".contactpage .uk-grid main.tm-content"));

    jQuery(".contactpage .contact-form fieldset > .control-group > .controls > input#jform_contact_name").attr("placeholder", "Name*");
    jQuery(".contactpage .contact-form fieldset > .control-group > .controls > input#jform_contact_email").attr("placeholder", "Email*");
    jQuery(".contactpage .contact-form fieldset > .control-group > .controls > input#jform_contact_emailmsg").attr("placeholder", "Subject*");
    jQuery(".contactpage .contact-form fieldset > .control-group > .controls > textarea#jform_contact_message").attr("placeholder", "Message*");
    jQuery(".contactpage .contact-form fieldset > .control-group > .controls > input#jform_customer_number").attr("placeholder", "Customer Number*");
    jQuery(".contactpage .contact-form form legend").text("GET IN TOUCH WITH US");
    jQuery(".contactpage .contact-form fieldset > .form-actions > button.btn").text("SUBMIT MESSAGE");
    jQuery(".contactpage .contact-form fieldset > .control-group:nth-child(7) > .control-label").insertAfter(jQuery(".contactpage .contact-form fieldset > .control-group:nth-child(7) .controls input"));
    // if(jQuery(".map").length == 0)
    // {
    //    jQuery('<div class="map"><iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3320.054401069218!2d151.02682131540482!3d-33.681655516801854!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6b12a0a0d09204cb%3A0x9cc51870c906c4d!2sDural+Medical+Centre!5e0!3m2!1sen!2sph!4v1471830561724" width="100%" height="330" frameborder="0" style="border:0" allowfullscreen></iframe></div>').insertBefore(
    //        jQuery(".contactpage main.tm-content .contact > dl.contact-address.dl-horizontal")
    // 	);
    // }

    jQuery("#contact-form").removeClass('well');

    jQuery(".contactpage .contact > h3:first-of-type").insertBefore(
        jQuery(".contactpage main.tm-content .contact > dl.contact-address.dl-horizontal")
    );

    // jQuery(".contactpage .contact > testing").insertAfter(
    //     jQuery(".contactpage main.tm-content .contact > dl.contact-address.dl-horizontal span.contact-street")
    // );

    jQuery(".optional").css({"color":"#ffffff","text-align":"left","top":-3,"left":-111,"zIndex":"auto","position":"relative","display":"inline"});

    jQuery("#contact-form > fieldset:nth-of-type(1) > div:nth-of-type(6) > div:nth-of-type(1)").css({"top":-17,"left":-85,"zIndex":"auto","position":"relative","display":"block"});

    jQuery("#contact-form").removeClass('well');

    jQuery(".contactpage .contact > h3").text("CONTACT INFORMATION");
    jQuery("img[src='/media/contacts/images/con_address.png']").attr("src","/media/contacts/images/con_address_alt.png");
    jQuery("img[src='/media/contacts/images/con_tel.png']").attr("src","/media/contacts/images/con_tel_alt.png");
    jQuery("img[src='/media/contacts/images/con_fax.png']").attr("src","/media/contacts/images/con_fax_alt.png");
});


/* ----------------------------------------------- FUNCTIONS -----------------------------------------------*/

function add_to_order(code) {

    var current_order = document.querySelector('.order-current-items');

    var el = jQuery('li[data-code="' + code + '"]')[0];

    el.setAttribute('data-coderight', code);

    el.removeAttribute('data-code');

    var el_html = el.innerHTML;

    el_html = el_html.replace(/\<div class\=\"order-add\">(.*?)\<\/div\>/, "<div class='order-remove'><input type='hidden' class='order-codes' name='product_code[]' value='" + code + "' /><a href='javascript:;' data-removecode='" + code + "' class='remove-from-order-form' title='Remove Product from Order Sheet'>Remove x</a></div>");

    el_html = el_html.replace('data-code', 'data-coderight');

    el.innerHTML = el_html;

    current_order.insertBefore(el, current_order.firstChild); // first element

    products_in_order.push(code);

}

function remove_from_order(code) {

    var product_index = products_in_order.indexOf(code);

    var el = jQuery('li[data-coderight="' + code + '"]')[0];

    products_in_order.splice(product_index, 1);

    el.parentNode.removeChild(el);

    jQuery('.order-form-search').trigger('keyup');

}

function add_inactive() {

    var save_order_sheet = document.querySelector('.order-form-save');

    save_order_sheet.className += ' inactive';

    window.onbeforeunload = false;

}

function remove_inactive() {

    // take inactive status off the save button

    var save_order_sheet = document.querySelector('.order-form-save');

    //console.log(save_order_sheet.className);

    save_order_sheet.className = save_order_sheet.className.replace('inactive', '');

    //console.log(save_order_sheet.className);

    window.onbeforeunload = function (e) {

        //return "Please note that your current order form has not been saved";
        return "You have not saved any of your changes. If you choose to leave this page without saving, your order form will not be updated.";
        //return "Are you sure you want to leave this page without saving your order form?";

    }

}

// Show Forgotten Password Popup
function forgottenPasswordPopup() {
    jQuery.fancybox(
        {
            'type': 'iframe',
            'href': config_url + 'includes/modules/forgotten_password.php',
            'autoDimensions': false,
            'width': 350,
            'height': 250,
            'transitionIn': 'none',
            'transitionOut': 'none',
            'scrolling': 'no'
        }
    );
}

// Show Statement Popup
function statementPopup() {
    jQuery.fancybox(
        {
            'type': 'iframe',
            'href': config_url + 'includes/modules/statement_popup.php',
            'autoDimensions': false,
            'width': 350,
            'height': 250,
            'transitionIn': 'none',
            'transitionOut': 'none',
            'scrolling': 'no'
        }
    );
}


// Show Product Detail Popup
function productPopup(fileSrc) {
    jQuery.fancybox(
        {
            'type': 'image',
            'href': fileSrc
        }
    );
}

// Update Lightbox Callback
function updateProductLightbox(fileSrc) {
    document.getElementById('lightbox_anchor').setAttribute('onclick', "productPopup('" + fileSrc + "')");
}

// Send Fotgotten Password Request
function sendForgottenPassword() {
    var emailAddress = document.getElementById('emailAddressForgotten').value;
}

// Do Search
function runSearch() {
    return false;
    searchVal = document.getElementById('productSearchInput').value;

    // Open Search Page

    if (searchVal.length > 0) {

        // Launch Login Screen

        runLoader('Searching for term <strong>' + searchVal + '</strong>');

        searchData = {"searchTerm": searchVal, "loadDefine": "true", "inlineSearchFull": "true"};

        jQuery.getJSON(config_url + 'includes/modules/search.php', searchData, function (data) {

            jQuery('#main_content').html(data.main);

            if (data.max > 0) {

                rangeSlider(data.min, data.max, data.min, data.max);

            }

            fixSearchHeights();

        });

        window.history.pushState({}, "", config_url + '?page=search&searchTerm=' + searchVal);

    }

    // reset the heights of elements

}

function fixSearchHeights() {

	/*
	 if (document.getElementById('contentLeft') || document.getElementById('contentRightMain')) {

	 var content_ele;
	 var content_height = 0;

	 if (document.getElementById('contentLeft')) {

	 content_ele = document.getElementById('contentLeft');

	 } else if (document.getElementById('contentRightMain')) {

	 content_ele = document.getElementById('contentRightMain');

	 }

	 if (document.getElementById('contentCategorySearch')) {

	 var category_ele = document.getElementById('contentCategorySearch');

	 if (category_ele.clientHeight > content_ele.clientHeight) {

	 content_height = category_ele.clientHeight;

	 } else {

	 content_height = content_ele.clientHeight;

	 }

	 } else {

	 content_height = content_ele.clientHeight;

	 }

	 var content_top_offset = content_ele.getBoundingClientRect().top; // height from top of contentLeft to top of doc

	 var container_top_offset = document.getElementById('container').offsetTop; // height from top of containe to top of doc

	 var holder_top_offset = document.getElementById('holder').offsetTop; // height from top of holder to top of doc

	 var container_padding_add = (container_top_offset - content_top_offset);

	 if (document.getElementById('contentCategorySearch')) {

	 document.getElementById('contentCategorySearch').style.height = content_height + 'px';

	 }

	 if (document.getElementById('whiteBackgroundHolder')) {

	 document.getElementById('whiteBackgroundHolder').style.height = content_height + 'px';

	 }

	 if (document.getElementById('whiteBackgroundLogin')) {

	 document.getElementById('whiteBackgroundLogin').style.height = content_height + 'px';

	 }

	 if (document.getElementById('contentRight')) {

	 document.getElementById('contentRight').style.height = content_height + 'px';

	 }

	 //document.getElementById('container').style.height = content_height + container_padding_add + 'px';

	 document.getElementById('holder').style.height = content_height + content_top_offset + 'px';

	 }

	 */
}

// Do Category Price Search

function categoryPriceSearch(slider) {

    var i = 0, price_arr, price_val, prod_code;

    // loop all the elements with pricing

    var pricing = document.getElementsByName('pricing[]');

    while (i < pricing.length) {

        price_arr = pricing[i].value.split('|');

        prod_code = price_arr[0];

        price_val = parseInt(price_arr[1]);

        if ((price_val >= slider.from) && (price_val <= slider.to)) {

            // is okay to show

            jQuery('div[data-code="' + prod_code + '"]').show();

        } else {

            jQuery('div[data-code="' + prod_code + '"]').hide();

        }

        i = i + 1;

    }

	/*
	 slider.min
	 slider.max
	 slider.from
	 slider.to
	 */


}

// Do Inline Search
function inlineSearch(slider, using_slider) {

    searchVal = document.getElementById('searchFilter').value;

    // Open Search Page

    if (searchVal.length > 0) {

        jQuery('.inline_search').html('<div class="loaderContent">Loading...&nbsp;&nbsp;<img src="img/ajax-loader.gif" border="0" width="16"></div>');

        // Launch Login Screen

        searchData = {"searchTerm": searchVal, "loadDefine": "true", "inlineSearch": "true"};

        if (using_slider) {

            from_price = parseInt(slider.from);

            to_price = parseInt(slider.to);

            searchData.prices = [from_price, to_price];

        }

        (function (x) {

            setTimeout(function (y) {

                //console.log(y);

                jQuery.getJSON(config_url + 'includes/modules/search.php', searchData, function (data) {

                    // insert content

                    if (data.main) {

                        var inline = document.querySelector('.inline_search');

                        inline.innerHTML = data.main;

                    }

                    if (data.lhs) {

                        var lhs = document.querySelector('#contentCategorySearch');

                        lhs.innerHTML = data.lhs;

                    }

                    if ((!using_slider) && (data.max)) {

                        var slider = {};

                        slider.from = data.min;

                        slider.to = data.max;

                        slider.min = data.min;

                        slider.max = data.max;

                    } else if (y) {

                        var slider = {};

                        slider.from = y.from;

                        slider.to = y.to;

                        slider.min = y.min;

                        slider.max = y.max;

                    }

                    if (slider) {

                        rangeSlider(slider.min, slider.max, slider.from, slider.to);

                    }

                    fixSearchHeights();

                });

                window.history.pushState({}, "", config_url + '?page=search&searchTerm=' + searchVal);

            }(x), 500);

        }(slider));


    }

}

// set the range slider for price filters

function rangeSlider(min_price, max_price, start_price, end_price, type) {

    var range_holder = document.querySelector('.rangeholder');

    if (range_holder) {

        range_holder.style.display = 'block';

    }

    jQuery("#rangeslider").ionRangeSlider({
        type: "double",
        min: min_price,
        max: max_price,
        from: start_price,
        to: end_price,
        prefix: "jQuery",
        onFinish: function () {

            var slider_val = document.getElementById('rangeslider').value;

            var slider_arr = slider_val.split(';');

            var start_price = slider_arr[0];

            var end_price = slider_arr[1];

            var slider_obj = {min: min_price, max: max_price, from: start_price, to: end_price};

            if (type == 'category') {

                categoryPriceSearch(slider_obj);

            } else {

                inlineSearch(slider_obj, true);

            }


        }
    });

}

function inlineFilter() {

    var slider_obj = {};

    // get the current slider values

    if (jQuery('#rangeslider').length > 0) {

        if (jQuery('#rangeslider').data("ionRangeSlider")) {

            var slider = jQuery('#rangeslider').data("ionRangeSlider").result;

            slider_obj = {'min': slider.min, 'max': slider.max, 'from': slider.from, 'to': slider.to}

        }

    }

    inlineSearch();

}

// function for showing the account logout message

function accountLogoutMsg() {

    var msg;

    msg = 'Due to inactivity your current session has timed out. Any items in your cart have been saved. To log back in please click <a href="/login">here</a>.</a>';

    fancyBoxPopup(msg, false);

    removeCookieTimeout();

}

// Do Loader. Used for when the screen is loading between content
function runLoader(text) {
    jQuery('#whiteBackgroundHolder').html('<div class="loaderContent">' + text + '&nbsp;&nbsp;<img src="'+config_url + 'img/ajax-loader.gif" border="0" width="16"></div>');
}

// Get the URL vars (if has a requested page. Go to that page)
function getUrlVars() {
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for (var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

function disableButton(elid) {
    // disable button
    var el = document.getElementById(elid);
    if (el) {
        jQuery(el).removeClass('orange');
        jQuery(el).addClass('grey');
        jQuery(el).html('Wait');
    }
}

function addToBasket(id) {

    //console.log('addToBasket('+id+')');

    var quantity = document.getElementById('qty').value;

    var valid_qty = is_whole_number(quantity);

    if (!valid_qty) {

        fancyBoxPopup("<strong>Error:</strong> All quantities must be a whole number please.<br /><br />", true);

        return false;

    }

    // Make Button Inactive
    jQuery('.addcart').attr('class', 'button grey addcart btn btn-warning');
    jQuery('.addcart').attr('disabled', 'disabled');
    jQuery('.addcart').html('Please Wait');
    jQuery('#contentRightPadding').html('<div class="cartLoaderPadding"><img src="'+config_url + +'img/ajax-loader.gif" border="0" width="16"></div>');

    productUpdateRequest(id, quantity);
}

function addToBasketDetail(id) {

    // check that is a whole number

    var qtyInput = 'qty-' + id;
    var quantity = document.getElementById(qtyInput).value;
    var valid_qty = is_whole_number(quantity);
    var addButton = 'add-' + id;
    var el = document.getElementById(addButton);

    if (quantity.length == 0) {
        if (jQuery(el)) {
            jQuery(el).html('Wait');
            setTimeout(function () {

                jQuery(el).html('No Qty Selected');
                setTimeout(function () {
                    jQuery(el).html('Add');
                }, 2000);
            }, 3000);
        }
        return false;
    }

    if (!valid_qty) {

        fancyBoxPopup("<strong>Error:</strong> All quantities must be a whole number please.<br /><br />", true);

        return false;

    }

    if (jQuery(el)) {
        jQuery(el).html('Wait');
    }

    //jQuery('#contentRightPadding').html('<div class="cartLoaderPadding"><img src="img/ajax-loader.gif" border="0" width="16"></div>');

    productUpdateRequest(id, quantity);

    if (jQuery(el)) {
        setTimeout(function () {

            jQuery(el).html('Item Added!');
            setTimeout(function () {
                jQuery(el).html('Add');
            }, 2000);
        }, 3000);


    }

}

function addToBasketDetailMemo(id, el) {

    //console.log('addToBasketDetailMemo('+id+', '+el+')');

    // check that is a whole number

    var qtyInput = 'qty-' + id;
    var quantity = document.getElementById(qtyInput).value;
    var valid_qty = is_whole_number(quantity);

    if (!valid_qty) {

        fancyBoxPopup("<strong>Error:</strong> All quantities must be a whole number please.<br /><br />", true);

        return false;

    }

    if (jQuery(el)) {
        jQuery(el).html('Wait');
    }

    checkSTKMemo(id, memoReturnDetail);

	/*
	 productUpdateRequest(id, quantity);

	 if (jQuery(el)) {
	 setTimeout(function () {
	 jQuery(el).removeClass('grey');
	 jQuery(el).addClass('orange');
	 jQuery(el).html('<img src="img/check-icon.png" border="0" />');
	 setTimeout(function () {
	 jQuery(el).html('Add');
	 }, 2000);
	 }, 3000);


	 }
	 */

}

function resetAddButton(){
    jQuery('.addcart').attr('class', 'btn btn-warning addcart');
    jQuery('.addcart').attr('disabled',false);
    jQuery('.addcart').html('Add to Basket');
}

function addToBasketMemo(id) {

    //console.log('addToBasketMemo('+id+')');

    var quantity = document.getElementById('qty').value;

    var valid_qty = is_whole_number(quantity);

    if(!valid_qty) {

        fancyBoxPopup("<strong>Error:</strong> All quantities must be a whole number please.<br /><br />", true);

        return false;

    }

    // Make Button Inactive
    jQuery('.addcart').attr('class', 'btn btn-default addcart');
    jQuery('.addcart').attr('disabled','disabled');
    jQuery('.addcart').html('Please Wait');
    jQuery('#contentRightPadding').html('<div class="cartLoaderPadding"><img src="'+config_url + +'img/ajax-loader.gif" border="0" width="16"></div>');

    jQuery('[data-cartitem=' + id + ']').html('&nbsp;');

    checkSTKMemo(id, memoReturn);

}

function checkSTKMemo(id, callback){

    //console.log('checkSTKMemo');

    var quantity = 1;
    if(ccData.session) {
        var requestData = {
            "webbasketopt": "A",
            "pagename": "memo_exists.html",
            "stk_id1": id,
            "userinfo": ccData.session,
            "DEBT_ID": ccData.DEBT_ID,
            "stk_qua1": quantity
        };
        clearConnectCall('clearconnect',requestData, callback); // Make Request to ClearConnect
    }
}

function memoReturnDetail(data){

    //console.log('memoReturnDetail(data)');

    var memo = '';
    var alt = data.STK_ALTPROD;

    if(data.STK_MEMO1 && data.STK_MEMO1 != "&nbsp"){
        memo = memo + data.STK_MEMO1 + '<br/>';
    }

    if(data.STK_MEMO2 && data.STK_MEMO2 != "&nbsp"){
        memo = memo + data.STK_MEMO2 + '<br/>';
    }

    if(data.STK_MEMO3 && data.STK_MEMO3 != "&nbsp"){
        memo = memo + data.STK_MEMO3 + '<br/>';
    }

    if(data.STK_MEMO4 && data.STK_MEMO4 != "&nbsp"){
        memo = memo + data.STK_MEMO4 + '<br/>';
    }

    if(data.STK_MEMO5 && data.STK_MEMO5 != "&nbsp"){
        memo = memo + data.STK_MEMO5 + '<br/>';
    }

    if(data.STK_MEMO6 && data.STK_MEMO6 != "&nbsp"){
        memo = memo + data.STK_MEMO6 + '<br/>';
    }


    if(data.STK_ALTPROD && data.STK_ALTPROD != "&nbsp"){
        var memoLink = "<a href=\""+config_url+"/?page=product_detail&sku=" + alt + "\">" + alt + "</a>";
        memo = memo.replace(' ' + alt + ' ', ' ' + memoLink + ' ');
        memo = memo +  "<br>For an alternative product please refer to product <a href=\""+ config_url + "?page=product_detail&sku=" + alt + "\" style=\"color:#ff7600;\">" + alt + "</a>";
    }

    //var hasMemo = true;

    if(memo != '') {

        //var popupMessage = memo + '<br /><br/><a href="javascript:;" class="btn btn-warning" onclick="javascript:resetAddButton();parent.jQuery.fancybox.close();">Okay</a>';
        var popupMessage = memo + '<br/><br/><button type="button" onclick="javascript:resetAddButton();parent.jQuery.fancybox.close();" class="btn btn-warning" data-dismiss="modal">Okay</button>';
        if(data.STK_ALTCOMP == 'N'){
            //popupMessage = popupMessage + ' <a href="javascript:;" class="btn btn-warning" onclick="javascript:addToBasket(\'' + data.id + '\');parent.jQuery.fancybox.close();">Add Original Product to Basket</a>';
            popupMessage = popupMessage + ' <button type="button" onclick="javascript:addToBasketDetail(\'' + data.id + '\');parent.jQuery.fancybox.close();" class="btn btn-warning" data-dismiss="modal">Add Original Product to Basket</button>';
        }
        //alert("Detail Memo");

        fancyBoxPopup(popupMessage, false);

    } else {
        //alert("Detail Add");

        //productUpdateRequest(id, quantity);
        addToBasketDetail(data.id);

    }

}

function memoReturn(data){

    //console.log('memoReturn('+data+')');

    var memo = '';

    var alt = data.STK_ALTPROD;

    if(data.STK_MEMO1 && data.STK_MEMO1 != "&nbsp"){
        memo = memo + data.STK_MEMO1 + '<br/>';
    }

    if(data.STK_MEMO2 && data.STK_MEMO2 != "&nbsp"){
        memo = memo + data.STK_MEMO2 + '<br/>';
    }

    if(data.STK_MEMO3 && data.STK_MEMO3 != "&nbsp"){
        memo = memo + data.STK_MEMO3 + '<br/>';
    }

    if(data.STK_MEMO4 && data.STK_MEMO4 != "&nbsp"){
        memo = memo + data.STK_MEMO4 + '<br/>';
    }

    if(data.STK_MEMO5 && data.STK_MEMO5 != "&nbsp"){
        memo = memo + data.STK_MEMO5 + '<br/>';
    }

    if(data.STK_MEMO6 && data.STK_MEMO6 != "&nbsp"){
        memo = memo + data.STK_MEMO6 + '<br/>';
    }


    if(data.STK_ALTPROD && data.STK_ALTPROD != "&nbsp"){
        var memoLink = "<a href=\"" + config_url + "?page=product_detail&sku=" + alt + "\">" + alt + "</a>";
        memo = memo.replace(' ' + alt + ' ', ' ' + memoLink + ' ');
        memo = memo +  "<br>For an alternative product please refer to product <a href=\""+ config_url + "?page=product_detail&sku=" + alt + "\" style=\"color:#ff7600;\">" + alt + "</a>";
    }

    //var hasMemo = true;

    if(memo != '') {

        //var popupMessage = memo + '<br /><br/><a href="javascript:;" class="btn btn-warning" onclick="javascript:resetAddButton();parent.jQuery.fancybox.close();">Okay</a>';
        var popupMessage = memo + '<br/><br/><button type="button" onclick="javascript:resetAddButton();parent.jQuery.fancybox.close();" class="btn btn-warning" data-dismiss="modal">Okay</button>';
        if(data.STK_ALTCOMP == 'N'){
            //popupMessage = popupMessage + ' <a href="javascript:;" class="btn btn-warning" onclick="javascript:addToBasket(\'' + data.id + '\');parent.jQuery.fancybox.close();">Add Original Product to Basket</a>';
            popupMessage = popupMessage + ' <button type="button" onclick="javascript:addToBasket(\'' + data.id + '\');parent.jQuery.fancybox.close();" class="btn btn-warning" data-dismiss="modal">Add Original Product to Basket</button>';
        }

        fancyBoxPopup(popupMessage, false);

    } else {

        //productUpdateRequest(id, quantity);
        addToBasket(data.id);

    }

}

// Update Product Request
function productUpdateRequest(id, quantity) {

    //console.log('productUpdateRequest('+id+', '+quantity+')');

    //console.log(ccData);

    if(ccData.session) {
        var requestData = {
            "webbasketopt": "A",
            "pagename": "update_order.html",
            "stk_id1": id,
            "userinfo": ccData.session,
            "DEBT_ID": ccData.DEBT_ID,
            "stk_qua1": quantity
        };
        clearConnectCall('clearconnect', requestData, returnProductAdd); // Make Request to ClearConnect
    }
}

// Return From Product Add
function returnProductAdd(data) {

    //console.log('returnProductAdd(' + data + ')');

    if(jQuery('.addcart')) {
        var addButton = '.addcart';
        var addButtonDefault = 'Add to Basket';
    }
    else if(jQuery('.addCartMed')) {
        var addButton = '.addCartMed';
        var addButtonDefault = 'Add'
    }
    // Reload the Cart
    jQuery(addButton).attr('disabled', false);

    if (data.ccReturn == 'success') {
        jQuery(addButton).html('Item Added!');

        // update menu display
        console.log('BASKET_TOTNUMITEMS='+data.BASKET_TOTNUMITEMS);
        if (data.BASKET_TOTNUMITEMS > 0) {

            var ccount = data.BASKET_TOTNUMITEMS / 100;

            jQuery('#cart-count').html(ccount);
            jQuery('#cart-count').css('display','inline-block');

        }
        else {

            jQuery('#cart-count').html('');
            jQuery('#cart-count').css('display','none');

        }

        jQuery('[data-cartitem=' + data.id + ']').html('<img src="' + config_url + 'img/in-cart-img.png" class="cart-image" title="You currently have ' + data.qty + ' in your cart">');
    }
    else {
        jQuery(addButton).html('Unable to Add Item!');
    }

    // Check for Warning Messages
    var warningMessage = '';
    jQuery.each(data, function (key, val) {

        if (key.indexOf('T1_') !== -1) {
            if (val.indexOf('WARNING') !== -1) {
                // show marning for logged in users only
                if(ccData.DEBT_ID != '2158999'){

                    var itemArray = val.split('|');
                    var itemSku = itemArray[0];
                    var warning = itemArray[itemArray.length - 2];
                    warningMessage += '<strong>' + itemSku + '</strong>&nbsp;' + warning + '<br /><br />';
                    warningMessage += 'Press close to keep ordering, please note that the original<br />quantity selected will still be added to your cart<br />';
                }
            }
        }
    });

    //console.log(data);
    //console.log(warningMessage);

    if (warningMessage != '') {
        fancyBoxPopup(warningMessage, true);
    }

    if (data.ErrorReturn != undefined) {
        var error = data.ErrorReturn;
        if (error.indexOf('(1002)') == -1) { // Check is not a random error
            error = error.replace(/\\n/g, '<br />');
            fancyBoxPopup('<strong>ERROR</strong><br />' + error, true);
        }
    }

    if (jQuery('#contentRightPadding')) {
        jQuery('#contentRightPadding').load(config_url + 'includes/files/cart-contents.php');
    }

    setTimeout(function () {
        jQuery(addButton).html(addButtonDefault);
    }, 4000);
}

function is_whole_number(num) {

    if (Number(num) % 1 != 0) {

        return false;

    } else {

        return true;

    }

}

function returnCartPage() {
    window.location = config_url + '?page=view_cart';
}

// Remove Item from Cart
function removeItem(id) {


    if(ccData.session) {
        var requestData = {
            "webbasketopt": "A",
            "pagename": "update_order.html",
            "stk_id1": id,
            "userinfo": ccData.session,
            "stk_qua1": "0",
            "DEBT_ID": ccData.DEBT_ID
        };
        clearConnectCall('clearconnect', requestData, returnCartPage); // Make Request to ClearConnect
    }
}

function updateQuantities() {



    if(ccData.session) {
        var requestData = {
            "webbasketopt": "A",
            "pagename": "update_order.html",
            "userinfo": ccData.session,
            "DEBT_ID": ccData.DEBT_ID
        };
        var count = 1;
        jQuery('input[name^=qty]').each(function () {
            // Build Object
            var qtyVal = jQuery(this).val();
            var sku = jQuery(this).data('sku');
            var stockId = "stk_id" + count;
            var stockQty = "stk_qua" + count;
            requestData[stockId] = sku;
            requestData[stockQty] = qtyVal;
            count++;
        });
        clearConnectCall('clearconnect', requestData, returnCartPage); // Make Request to ClearConnect
    }
}

function doUpdatePassword() {
    // Make Button Inactive
    jQuery('#passwordUpdate').attr('class', 'button grey');
    jQuery('#passwordUpdate').attr('disabled', 'disabled');
    jQuery('#passwordUpdate').html('Please Wait');

    // Get Values
    var curPassword = jQuery('#currentPwd').val();
    var newPassword = jQuery('#newPwd').val();
    var reNewPassword = jQuery('#reNewPwd').val();
    var errorMsg = '';

    if (curPassword == '') {
        errorMsg += "Please Enter Current Password!\n";
    }
    if (newPassword == '') {
        errorMsg += "Please Enter New Password!\n";
    }
    if (reNewPassword == '') {
        errorMsg += "Please Re Enter New Password!\n";
    }

    if (newPassword != reNewPassword) {
        errorMsg += "New Passwords do not Match!\n";
    }

    // Has Error
    if (errorMsg != '') {
        // Do Error Message
        alert(errorMsg);
        // Make Button Active
        jQuery('#passwordUpdate').attr('class', 'btn btn-warning');
        jQuery('#passwordUpdate').attr('disabled', false);
        jQuery('#passwordUpdate').html('Update Password');
    } else {
        jQuery('#updatePassword').submit();
    }
}


function validateCheckoutForm(cform) {
	/*
	 if (cform.purchaseOrderNo.value == '') {
	 alert("Please enter a Purchase Order/Reference/Name!\n");
	 return false;
	 }
	 */

    if (cform.contactName.value == '') {
        alert("Please enter a Contact Name!\n");
        return false;
    }

    cform.submit();
}

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if(!re.test(email)){
        alert(email+' is not a correct email');
        document.getElementById("email").value = "";
    }
}

function validateConfirmationForm(cform) {
    error = false;
    if(!jQuery('#tc_check').prop('checked')) { error = "Please agree to our Terms & Conditions and Privacy Policy\n"; }
    if(error) {
        alert(error);
        return false;
    }
    window.onbeforeunload = false;
    cform.submit();
}

// Function will get all of the selected Invoices and send them to the correct JSON string for post
function onlinePaymentAddInvoices() {
    var arr = new Object();
    var count = 1;
    jQuery('.orderUpdate').each(function () {
        var invoice = jQuery(this).val(); // Get the Invoice ID
        var amount = parseFloat(jQuery(this).data('value')); // The jQuery Value of the Invoice
        isChecked = jQuery(this).is(':checked'); // Get the Checked/Unchecked boolean Value
        if (isChecked) {
            arr[count] = {'invoice': invoice, 'amount': amount};
            count++;
        }
    });
    validateCreditCardInput('payment-submission', arr);
}

function validateCreditCardInputOld(loadfile, extraData) {

    // Disable Button
    jQuery('.payment_proceed').attr('class', 'btn btn-default payment_proceed');
    jQuery('.payment_proceed').html('Please Wait...');
    jQuery('.payment_proceed').disabled = true;

    // Set the Variables for the Credit Card Input
    error = '';

    if (loadfile != 'order-submission-account') {
        cardName = jQuery('#cardName').val();
        cardNumber = jQuery('#cardNumber').val();
        cardNumber = cardNumber.replace(/ /g,'');
        expiryMonth = jQuery('#expiryMonth').val();
        expiryYear = jQuery('#expiryYear').val();
        cardCcv = jQuery('#cardCcv').val();
        cardType = jQuery('#cardType').val();
        email = jQuery("[name='customer_email']").val();
        business = jQuery("[name='customer_business']").val();


        // Errors
        if (cardName == '') {
            error += "Please Enter a Card Name\n";
        }

        if (cardNumber == '') {
            error += "Please Enter a Card Number\n";
        } else {
            if (isNaN(cardNumber.replace(/ /g,''))) {
                error += "Please Enter a Valid Card Number\n";
            }
        }

        if (expiryMonth == '') {
            error += "Please Enter an Expiry Month\n";
        }
        if (expiryYear == '') {
            error += "Please Enter an Expiry Year\n";
        }
        if (cardCcv == '') {
            error += "Please Enter a Card CCV\n";
        }
        if (cardType == '') {
            error += "Please Enter a Card Type\n";
        }
    }

    if (error != '') {
        alert(error); // Has Errors
        jQuery('.payment_proceed').attr('class', 'btn btn-warning payment_proceed');
        jQuery('.payment_proceed').html('Submit Order');
        jQuery('.payment_proceed').disabled = false;
    } else {
        // No Errors, Can Submit Form


        if(ccData.session) {
            if (loadfile != 'order-submission-account') {
                jsonString = {
                    "submitOrder": "Yes",
                    "cardName": cardName,
                    "cardNumber": cardNumber,
                    "cardType": cardType,
                    "expiryMonth": expiryMonth,
                    "expiryYear": expiryYear,
                    "cardCcv": cardCcv,
                    "session": ccData.session,
                    "debtID": ccData.DEBT_ID
                };

                if (email) {
                    jsonString.customer_email = email;
                }

                if (business) {
                    jsonString.customer_contact = business;
                }

            } else {
                jsonString = {"submitOrder": "Yes", "session": ccData.session, "debtID": ccData.DEBT_ID}
            }

            // Add the Extra Data Sent to the Function
            if (extraData) {
                jsonString['invoices'] = extraData;
            }

            loadFile = config_url + 'includes/files/' + loadfile + '.php';

            // Submit Form Via Ajax
            jQuery.getJSON(loadFile, jsonString, function (data) {

                if (data.RETURN == 'SUCCESS') {
                    // Redirect to Confirmation Page
                    if (loadfile == 'payment-submission') {
                        // Is Successful Payment Submission. Hide the Payment Form and Show Successful Message
                        jQuery('.creditCardDisplay').fadeOut(300);
                        jQuery('.addMessage').fadeOut(300);
                        jQuery('.addTotal').fadeOut(300);
                        jQuery('#payment_wrapper').fadeOut(300);
                        jQuery('#no-more-tables').fadeOut(300);
                        //alert(data.PAYMENT_MESSAGE);
                        jQuery('#main_content').append('<br clear="both" /><p>' + data.PAYMENT_MESSAGE + '</p>');
                        jQuery("html, body").animate({ scrollTop: 0 }, "slow");

                        // update the checkboxes to pending msg
                        jQuery('.orderUpdate').each(function () {
                            if (jQuery(this).prop('checked') == true) {
                                jQuery(this).parent('td').html('pending');
                            }
                        });

                    }
                    else if (loadfile == 'order-submission') {
                        jQuery('#main_content').html('<h1>Order Confirmation (Successful Payment)</h1><p>' + data.PAYMENT_MESSAGE + '</p>');
                    }
                    else if (loadfile == 'order-submission-account') {
                        jQuery('#main_content').html('<h1>Order Confirmation (Successful Order)</h1><p>' + data.PAYMENT_MESSAGE + '</p>');
                    }
                    // clear cart count
                    if(jQuery('#cart-count')) {
                        jQuery('#cart-count').html('');
                        jQuery('#cart-count').css('display','none');
                    }

                }
                else {
                    var mystr = data.MESSAGE;
                    var paymentm = mystr.replace('<br>','\n');
                    alert("Sorry, the order could not be completed!\n" + paymentm);
                    jQuery('.payment_proceed').attr('class', 'btn btn-warning payment_proceed');
                    jQuery('.payment_proceed').html('Submit Order');
                    jQuery('.payment_proceed').disabled = false;
                }

                // disable unload message
                window.onbeforeunload = false;
                document.removeEventListener('click', note_func, false);

                // clear cart count
                if(jQuery('#cart-count')) {
                    jQuery('#cart-count').html('');
                    jQuery('#cart-count').css('display','none');
                }


            });

        }

    }
}

function validateCreditCardInput(loadfile, extraData) {

    // Disable Button
    jQuery('.payment_proceed').attr('class', 'btn btn-default payment_proceed');
    jQuery('.payment_proceed').html('Please Wait...');
    jQuery('.payment_proceed').disabled = true;

    // Set the Variables for the Credit Card Input
    error = '';

    if (loadfile != 'order-submission-account') {
        cardName = jQuery('#cardName').val();
        cardNumber = jQuery('#cardNumber').val();
        expiryMonth = jQuery('#expiryMonth').val();
        expiryYear = jQuery('#expiryYear').val();
        cardCcv = jQuery('#cardCcv').val();
        cardType = jQuery('#cardType').val();
        email = jQuery("[name='customer_email']").val();
        business = jQuery("[name='customer_business']").val();

        // Errors
        if (cardName == '') {
            error += "Please Enter a Card Name\n";
        }

        if (cardNumber == '') {
            error += "Please Enter a Card Number\n";
        }
        else {
            if (isNaN(cardNumber.replace(/ /g,''))) {
                error += "Please Enter a Valid Card Number\n";
            }
        }

        if (expiryMonth == '') {
            error += "Please Enter an Expiry Month\n";
        }
        if (expiryYear == '') {
            error += "Please Enter an Expiry Year\n";
        }
        if (cardCcv == '') {
            error += "Please Enter a Card CCV\n";
        }
        if (cardType == '') {
            error += "Please Enter a Card Type\n";
        }
    }
    else if(loadfile == 'order-submission-account') {
        if(!jQuery('#tc_check').prop('checked')) { error += "Please agree to our Terms & Conditions and Privacy Policy\n"; }
    }

    if (error != '') {
        alert(error); // Has Errors
        jQuery('.payment_proceed').attr('class', 'btn btn-warning payment_proceed');
        jQuery('.payment_proceed').html('Submit Order');
        jQuery('.payment_proceed').disabled = false;
    }
    else {
        // No Errors, Can Submit Form


        if(ccData.session) {
            if (loadfile != 'order-submission-account') {
                jsonString = {
                    "submitOrder": "Yes",
                    "cardName": cardName,
                    "cardNumber": cardNumber.replace(/ /g,''),
                    "cardType": cardType,
                    "expiryMonth": expiryMonth,
                    "expiryYear": expiryYear,
                    "cardCcv": cardCcv,
                    "session": ccData.session,
                    "debtID": ccData.DEBT_ID
                };

                if (email) {
                    jsonString.customer_email = email;
                }

                if (business) {
                    jsonString.customer_contact = business;
                }

            }
            else {
                jsonString = {"submitOrder": "Yes", "session": ccData.session, "debtID": ccData.DEBT_ID}
            }

            // Add the Extra Data Sent to the Function
            if (extraData) {
                jsonString['invoices'] = extraData;
            }

            loadFile = config_url + 'includes/files/' + loadfile + '.php';

            // Submit Form Via Ajax
            jQuery.getJSON(loadFile, jsonString, function (data) {

                if (data.RETURN == 'SUCCESS') {
                    // Redirect to Confirmation Page
                    if (loadfile == 'payment-submission') {
                        // Is Successful Payment Submission. Hide the Payment Form and Show Successful Message
                        jQuery('.creditCardDisplay').fadeOut(300);
                        jQuery('.addMessage').fadeOut(300);
                        jQuery('.addTotal').fadeOut(300);
                        jQuery('#payment_wrapper').fadeOut(300);
                        jQuery('#no-more-tables').fadeOut(300);
                        //alert(data.PAYMENT_MESSAGE);
                        jQuery('#main_content').append('<br clear="both" /><p>' + data.PAYMENT_MESSAGE + '</p>');
                        jQuery("html, body").animate({ scrollTop: 0 }, "slow");

                        // update the checkboxes to pending msg
                        jQuery('.orderUpdate').each(function () {
                            if (jQuery(this).prop('checked') == true) {
                                jQuery(this).parent('td').html('pending');
                            }
                        });

                    }
                    else if (loadfile == 'order-submission') {
                        jQuery('#main_content').html('<h1>Order Confirmation (Successful Payment)</h1><p>' + data.PAYMENT_MESSAGE + '</p>');
                        // Facebook Pixel
                        fbq('init', '1147819835311599');
                        fbq('track', 'PageView');
                    }
                    else if (loadfile == 'order-submission-account') {
                        jQuery('#main_content').html('<h1>Order Confirmation (Successful Order)</h1><p>' + data.PAYMENT_MESSAGE + '</p>');
                        // Facebook Pixel
                        fbq('init', '1147819835311599');
                        fbq('track', 'PageView');
                    }
                    // clear cart count
                    if(jQuery('#cart-count')) {
                        jQuery('#cart-count').html('');
                        jQuery('#cart-count').css('display','none');
                    }

                }
                else {
                    var mystr = data.MESSAGE;
                    var paymentm = mystr.replace('<br>','\n');
                    alert("Sorry, the order could not be completed!\n" + paymentm);
                    jQuery('.payment_proceed').attr('class', 'btn btn-warning payment_proceed');
                    jQuery('.payment_proceed').html('Submit Order');
                    jQuery('.payment_proceed').disabled = false;
                }

                // disable unload message
                window.onbeforeunload = false;
                document.removeEventListener('click', note_func, false);

                // clear cart count
                if(jQuery('#cart-count')) {
                    jQuery('#cart-count').html('');
                    jQuery('#cart-count').css('display','none');
                }


            });

        }

    }
}

function updateDeliveryAddress(address) {

    jQuery('#deliveryAddress').val('Loading...');
    jQuery('#deliveryInstructions').val('Loading...');

    var request = {"returnAddress": address};
    var setAddress = '';
    var instructions = '';
    jQuery.getJSON(config_url + 'includes/files/account-details-json.php', request, function (data) {
        if (data.RETURN == 'SUCCESS') {

            // Update Address Details
            if (data.deliveryLine1 != '') {
                setAddress += data.deliveryLine1 + "\n";
            }
            if (data.deliveryLine2 != '') {
                setAddress += data.deliveryLine2 + "\n";
            }
            if (data.deliveryLine3 != '') {
                setAddress += data.deliveryLine3 + "\n";
            }
            if (data.deliveryLine4 != '') {
                setAddress += data.deliveryLine4 + "\n";
            }

            if (data.deliveryInstructions1 != '') {
                instructions += data.deliveryInstructions1 + "\n";
            }
            if (data.deliveryInstructions2 != '') {
                instructions += data.deliveryInstructions2 + "\n";
            }

            jQuery('#deliveryAddress').val(setAddress);
            jQuery('#deliveryInstructions').val(instructions);
            jQuery('#deliveryName').val(data.deliveryName);

        }
    });
}

function setDeliveryAddress(address) {

    if(address) {
        jQuery('.delAddress').html('Loading...');
        jQuery('.delInstructions').html('Loading...');

        var request = {"returnAddress": address, "saveAddress": "1"}
        var setAddress = '';
        var instructions = '';
        jQuery.getJSON(config_url + 'includes/files/account-details-json.php', request, function (data) {
            if (data.RETURN == 'SUCCESS') {
                // Update Address Details
                if (data.deliveryLine1 != '') {
                    setAddress += data.deliveryLine1 + "<br />";
                }
                if (data.deliveryLine2 != '') {
                    setAddress += data.deliveryLine2 + "<br />";
                }
                if (data.deliveryLine3 != '') {
                    setAddress += data.deliveryLine3 + "<br />";
                }
                if (data.deliveryLine4 != '') {
                    setAddress += data.deliveryLine4;
                }
                if (data.deliveryInstructions1 != '') {
                    instructions += data.deliveryInstructions1 + "<br />";
                }
                if (data.deliveryInstructions2 != '') {
                    instructions += data.deliveryInstructions2;
                }
                jQuery('.delAddress').html(setAddress);
                jQuery('.delInstructions').html(instructions);
                jQuery('.delAddressDisplay').val(encodeURI(setAddress));
            }
        });
    }
    else {
        jQuery('.delAddress').html('');
        jQuery('.delInstructions').html(instructions);
        jQuery('.delAddressDisplay').val('');
    }
}

function nl2br (str, is_xhtml) {
    // http://kevin.vanzonneveld.net
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: Philip Peterson
    // +   improved by: Onno Marsman
    // +   improved by: Atli ��r
    // +   bugfixed by: Onno Marsman
    // +      input by: Brett Zamir (http://brett-zamir.me)
    // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: Brett Zamir (http://brett-zamir.me)
    // +   improved by: Maximusya
    // *     example 1: nl2br('Kevin\nvan\nZonneveld');
    // *     returns 1: 'Kevin<br />\nvan<br />\nZonneveld'
    // *     example 2: nl2br("\nOne\nTwo\n\nThree\n", false);
    // *     returns 2: '<br>\nOne<br>\nTwo<br>\n<br>\nThree<br>\n'
    // *     example 3: nl2br("\nOne\nTwo\n\nThree\n", true);
    // *     returns 3: '<br />\nOne<br />\nTwo<br />\n<br />\nThree<br />\n'
    var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br ' + '/>' : '<br>'; // Adjust comment to avoid issue on phpjs.org display

    return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
}

function fancyBoxPopup(message, close_btn) {

    var content = message;

    if(close_btn) {
        content += '<br /><a href="javascript:;" class="btn btn-warning" onclick="parent.jQuery.fancybox.close();">Close</a>';
    }

    jQuery.fancybox({
        'type':'inline',
        'scrolling':'no',
        'closeBtn':false,
        'content':'<div style="text-align:center"><p>'+content+'</p></div>',
        'locked':false,
        'fixed':false
    });
}
/*

 function fancyBoxPopup(message, close_btn) {

 var content = '<div class="modal-body">' + message + '</div>';

 if (close_btn) {
 content += '<div class="modal-footer"><button type="button" class="btn btn-warning" data-dismiss="modal">Close</button></div>';
 }
 jQuery('#myModalContent').html(content);
 jQuery('#myModal').modal();
 }
 */

/*function fancyBoxPopupReload(message) {
 var content = '<div class="modal-body">' + message + '</div>';
 content += '<div class="modal-footer"><button type="button" class="btn btn-warning" data-dismiss="modal">Close</button></div>';
 jQuery('#myModalContent').html(content);
 jQuery('#myModal').modal();
 }*/

function addAllBasket() {



    if(ccData.session) {

        var requestData = {
            "webbasketopt": "A",
            "pagename": "update_order.html",
            "userinfo": ccData.session,
            "DEBT_ID": ccData.DEBT_ID
        };
        var hasItems = false;
        var count = 1;
        var qty_error = false;

        jQuery('.qtyInput').each(function () {

            code = jQuery(this).data('code');

            qty = jQuery(this).val();

            if (qty > 0) {

                var is_valid = is_whole_number(qty);

                if (!is_valid) {

                    fancyBoxPopup('<strong>Error:</strong> Qty for Code ' + code + " is invalid.<br />All quantities must be a whole number please.<br /><br />", true);

                    qty_error = true;

                }

                requestData["stk_id" + count] = code;
                requestData["stk_qua" + count] = qty;

                if (jQuery('[data-cartitem=' + code + ']')) {

                    if (qty > 0) {

                        jQuery('[data-cartitem=' + code + ']').html('<img src="/shop/img/in-cart-img.png" class="cart-image" title="You currently have ' + qty + ' in your cart">');

                    } else {

                        jQuery('[data-cartitem=' + code + ']').html('&nbsp;');

                    }

                }

                count++;
                hasItems = true;
            }
        });
        if (qty_error) {

            return false;

        }

        // Make Button Inactive
        jQuery('.addAll').attr('disabled', 'disabled');
        jQuery('.addAll').html('Please Wait');

        if (!hasItems) {
            // Make Button Inactive
            jQuery('.addAll').removeAttr('disabled');
            jQuery('.addAll').html('No Items to Add!');
            setTimeout(function () {
                jQuery('.addAll').html('Add Multiple');
            }, 2000);
        }

        clearConnectCall('clearconnect', requestData, returnProductAddMultiple); // Make Request to ClearConnect

    }

}

function returnProductAddMultiple(data) {
    if (data.ccReturn == "success") {
        jQuery('.addAll').html('Updated!');
        // Make Button Inactive
        jQuery('.addAll').attr('class', 'btn btn-warning addAll');
        jQuery('.addAll').attr('disabled', false);
        // update menu display
        console.log('BASKET_TOTNUMITEMS='+data.BASKET_TOTNUMITEMS);
        if (data.BASKET_TOTNUMITEMS > 0) {

            var ccount = data.BASKET_TOTNUMITEMS / 100;

            jQuery('#cart-count').html(ccount);
            jQuery('#cart-count').css('display','inline-block');

        }
        else {

            jQuery('#cart-count').html('');
            jQuery('#cart-count').css('display','none');

        }
        // Check for Warning Messages
        var warningMessage = '';
        jQuery.each(data, function (key, val) {
            if (key.indexOf('T1_') !== -1) {
                if (val.indexOf('WARNING') !== -1) {
                    var itemArray = val.split('|');
                    var itemSku = itemArray[0];
                    var warning = itemArray[itemArray.length - 2];
                    warningMessage += '<strong>' + itemSku + '</strong>&nbsp;' + warning + '<br /><br />';
                }
            }
        });

        if (warningMessage != '') {
            fancyBoxPopup(warningMessage, true);
        }

    }
    setTimeout(function () {
        jQuery('.addAll').html('Add Multiple');
    }, 3000);
}

function is_whole_number(num) {

    if (Number(num) % 1 != 0) {

        return false;

    } else {

        return true;

    }

}

function returnCartPage() {
    window.location = config_url + '?page=view_cart';
}

// Empty Cart Function
function emptyCart() {


    if(ccData.session) {
        var requestData = {
            "webbasketopt": "DALL",
            "pagename": "update_order.html",
            "userinfo": ccData.session,
            "DEBT_ID": ccData.DEBT_ID
        };
        clearConnectCall('clearconnect', requestData, returnDeleteAll); // Make Request to ClearConnect
    }
}

// Return from Delete All Request
function returnDeleteAll(data) {
    if (data.ccReturn == 'success') {
        location.reload();
    }
}

// Open Popup for Template Creation
function createTemplate() {
    jQuery.fancybox(
        {
            'type': 'iframe',
            'href': config_url + 'includes/modules/create_template.php',
            'autoDimensions': false,
            'width': 350,
            'height': 'auto',
            'transitionIn': 'none',
            'transitionOut': 'none',
            'scrolling': 'no'
        }
    );
}

// Remove An Item from a Template
function templateRemove(sku, template) {
    jsonString = {'template': template, 'sku': sku, 'action': 'remove'};
    jQuery.getJSON(config_url + '/includes/files/set_template.php', jsonString, function (data) {
        if (data.RETURN == 'SUCCESS') {
            location.reload();
        }
    });
}

function table2csv(oTable, exportmode, tableElm) {
    var csv = '';
    var headers = [];
    var rows = [];

    // Get header names
    var tHeadElement = tableElm + ' thead tr';

    jQuery(tHeadElement).find('th').each(function () {
        var $th = jQuery(this);
        var text = $th.text();
        var header = '"' + text + '"';
        if (text != "") headers.push(header); // actually datatables seems to copy my original headers so there ist an amount of TH cells which are empty
    });

    csv += jQuery('#csvHeader').val() + "\n";

    jQuery('#purchaseTable > tbody  > tr').each(function () {
        if (jQuery(this).css('display') != 'none') {
            var lineContent = '';
            jQuery(this).children("td").each(function () {
                var content = strip_tags(jQuery(this).html());
                if (content != 'Add') {
                    lineContent += content + ",";
                }
            });
            csv += lineContent.substring(0, lineContent.length - 1) + "\n";
        }
    });

    // if a csv div is already open, delete it
    if (jQuery('#csvForm').length) {
        jQuery('.csvHidden').val("");
        jQuery('.csvHidden').val(csv);
    } else {
        jQuery('body').append('<form enctype="multipart/form-data" method="post" action="/shop/includes/files/csv-export.php" id="csvForm"><input type="hidden" name="csv" class="csvHidden" value="' + encodeURI(csv) + '"></form>');
    }
    setTimeout(function () {
        document.getElementById('csvForm').submit();
    }, 200);
}

function strip_tags(html) {
    var tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText;
}

function exportTable() {
    var asInitVals = new Array();
    var oTable = jQuery('#purchaseTable');
    table2csv(oTable, 'full', 'purchaseTable');
}

function removeTemplateRequest(id) {
    var setConfirmation = confirm('Do you want to remove this Order Form Template?');
    if (setConfirmation == true) {
        window.location = config_url + '?page=order_form_template&id=' + id + '&remove=true';
    }
    return;
}

function validate_cc_guest() {

    var error = '', card_name, card_number, expiry_month, expiry_year, card_ccv, card_type, email_address, load_file, json_string;

    // select the dom element values

    card_name = jQuery('#cardName').val();

    card_number = jQuery('#cardNumber').val();
    card_number = card_number.replace(/ /g,'');

    card_ccv = jQuery('#cardCcv').val();

    card_type = jQuery('#cardType').val();

    expiry_month = jQuery('#expiryMonth').val();

    expiry_year = jQuery('#expiryYear').val();


    email_address = jQuery('#email').val();

    // disable the submit button

    jQuery('.guest_submit').attr('class', 'btn btn-default guest_submit');

    jQuery('.guest_submit').html('Please Wait...');

    jQuery('.guest_submit').disabled = true;

    // validate the inputs

    // Errors

    if(card_name == '') { error += "Please Enter a Card Name\n"; }

    if(card_number == '') {

        error += "Please Enter a Card Number\n";

    } else {

        if(isNaN(card_number.replace(/ /g,''))) {

            error += "Please Enter a Valid Card Number\n";

        }

    }

    if(expiry_month == '') { error += "Please Enter an Expiry Month\n"; }

    if(expiry_year == '') { error += "Please Enter an Expiry Year\n"; }

    if(card_ccv == '') { error += "Please Enter a Card CCV\n"; }

    if(card_type == '') { error += "Please Enter a Card Type\n"; }

    //if(!$('#checkMeOut').prop('checked')) { error += "Please Agree Our Terms & Conditions and Privacy Policy\n"; }
    if(!jQuery('#tc_check').prop('checked')) { error += "Please Agree Our Terms & Conditions and Privacy Policy\n"; }

    if(error != '') {

        alert(error); // Has Errors

        jQuery('.guest_submit').attr('class','btn btn-warning guest_submit');

        jQuery('.guest_submit').html('Submit Order');

        jQuery('.guest_submit').disabled = false;

    } else {

        // do the submission

		/*
		 var ccCookieString = decodeURI(readCookie('cc-cookie')); // Has a Cookie, check if valid and continue
		 var n = ccCookieString.search('%3A');
		 if(n > 0){
		 var findthis = '%3A';
		 var re = new RegExp(findthis, 'g');
		 ccCookieString = ccCookieString.replace(re, ":");
		 }
		 var n = ccCookieString.search('%2C');
		 if(n > 0){
		 var findthis = '%2C';
		 var re = new RegExp(findthis, 'g');
		 ccCookieString = ccCookieString.replace(re, ",");
		 }

		 var ccData = jQuery.parseJSON(ccCookieString);
		 */
        // Get user session data
		/*ccData = false;
		 config_url = 'https://www.teammed.com.au/shop/';

		 jQuery.ajax({
		 type: "GET",
		 url: config_url + "includes/files/session.php",
		 cache: false,
		 success: function(data){
		 if(data) {
		 ccData = jQuery.parseJSON(data);
		 }
		 //console.log('ccData:'+ccData);
		 }
		 });*/

        //console.log(ccData);
        //console.log(config_url);

        // Check for Invalid Cookie

        if(!ccData) { invalidCookie(); }

        json_string = {"retailOrder": "Y", "submitOrder":"Yes", "cardName":card_name, "cardNumber":card_number, "cardType":card_type, "expiryMonth":expiry_month, "expiryYear":expiry_year, "cardCcv":card_ccv, "session":ccData.session, "debtID":ccData.DEBT_ID}

        if(email_address) {

            json_string.email = email_address;

        }

    }

    //load_file = './includes/files/order-submission.php';
    load_file = config_url+'includes/files/order-submission.php';

    // Submit Form Via Ajax

    jQuery.getJSON(load_file, json_string, function(data) {

        if(data.RETURN == 'SUCCESS') {

            jQuery('#contentLeftFull').html('<h1>Order Confirmation (Successful Payment)</h1><p>' + data.PAYMENT_MESSAGE + '</p>');

        }
        else if(data.RETURN == 'CAS_ERROR') {

            alert("Sorry, the order not be completed!\n"+data.MESSAGE);

            jQuery('.guest_submit').attr('class','btn btn-warning guest_submit');
            jQuery('.guest_submit').html('Submit Order');
            jQuery('.guest_submit').disabled = false;

        }
        else {

            alert("Sorry, there was a problem submitting your payment!\n"+data.MESSAGE);

            jQuery('.guest_submit').attr('class', 'btn btn-default guest_submit');
            jQuery('.guest_submit').html('Payment Error!');
            jQuery('.guest_submit').disabled = true;

        }

    });

}

function validate_phone_guest() {

    var phone = jQuery('#phone').val();

    var load_file, json_string;

    if(phone == '') {

        alert('Phone Number needs to be entered!');

        return false;

    }

    if(phone.length < 8) {

        alert('Please enter a valid Phone Number!');

        return false;

    }

    // submit the order with the notice

    //load_file = './includes/files/order-submission-freight.php';
    load_file = config_url+'includes/files/order-submission-freight.php';

    // Get user session data
    //ccData = false;
	/*
	 jQuery.ajax({
	 type: "GET",
	 url: config_url + "includes/files/session.php",
	 cache: false,
	 success: function(data){
	 if(data) {
	 ccData = jQuery.parseJSON(data);
	 }
	 //console.log('ccData:'+ccData);
	 }
	 });
	 */

    //console.log(config_url);
    //console.log(ccData);

    if(!ccData) { invalidCookie(); }

    json_string = {"submitOrder":"Yes", "phone":phone, "session":ccData.session, "debt_id":ccData.DEBT_ID}

    jQuery.getJSON(load_file, json_string, function(data) {

        if(data.RETURN == 'SUCCESS') {

            jQuery('#contentLeftFull').html('<h1>Confirmation</h1><p>Your order has been sent to Team Medical and a Representative will be in touch with you shortly.</p>');

            // clear cart count
            if(jQuery('#cart-count-span')) {
                jQuery('#cart-count-span').html('');
            }

        } else if(data.RETURN == 'ERROR') {

            alert("Sorry, there was a problem making your request!\n" + data.MESSAGE);

            jQuery('.guest_submit').attr('class','btn btn-warning guest_submit');

            jQuery('.guest_submit').html('Submit Order');

            jQuery('.guest_submit').disabled = false;

        }

    });

}

function invalidCookie() {
    alert('Your Session has ended. Please login again.');
    window.location = '/';
}

function calculate_now() {
    // Make Button Inactive
    jQuery('#calculate_button').attr('class', 'button grey');
    jQuery('#calculate_button').attr('disabled', 'disabled');
    jQuery('#calculate_button').html('Please Wait');

    // Get Values
    var firstname = jQuery('#firstname').val();
    var surname = jQuery('#surname').val();
    var email = jQuery('#email').val();
    var phone_number = jQuery('#phone_number').val();
    var postcode = jQuery('#postcode').val();
    var errorMsg = '';

    if (firstname == 'undefined' || firstname == '') {
        errorMsg += "Please Enter First Name!\n";
    }
    if (surname == 'undefined' || surname == '') {
        errorMsg += "Please Enter Surname!\n";
    }
    if (email == 'undefined' || email == '' ) {
        errorMsg += "Please Enter Email!\n";
    }
    if (phone_number == 'undefined' || phone_number == '') {
        errorMsg += "Please Enter Phone Number!\n";
    }
    if (postcode == 'undefined' || postcode == '') {
        errorMsg += "Please Enter Postcode!\n";
    }
    // Has Error
    if (errorMsg != '') {
        // Do Error Message
        alert(errorMsg);
        // Make Button Active
        jQuery('#calculate_button').attr('class', 'btn btn-warning');
        jQuery('#calculate_button').attr('disabled', false);
        jQuery('#calculate_button').html('Click here to calculate');
    } else {
        jQuery('#setup_calculator').submit();
    }
}

function validatePhoneNumber(number) {
    var re = /^\d+$/;
    if(!re.test(number)){
        alert(number +' is not a correct number');
        document.getElementById("phone_number").value = "";
    }
}

function validatePostcode(postcode) {
    var re = /^[0-9]{4}$/;
    if(!re.test(postcode)){
        alert(postcode +' is not a correct postcode');
        document.getElementById("postcode").value = "";
    }
}

function print_form() {
    var x = document.getElementsByClassName("qtyInput");
    var i;
    for (i = 0; i < x.length; i++) {
        x[i].placeholder = "";
    }
    window.print();
    var x = document.getElementsByClassName("qtyInput");
    var i;
    for (i = 0; i < x.length; i++) {
        x[i].placeholder = "Qty";
    }
}



