package com.trunghoang.teammedical.service;

import com.trunghoang.teammedical.model.Invoice;
import com.trunghoang.teammedical.model.InvoiceLineItem;
import com.trunghoang.teammedical.model.InvoiceSummary;
import com.trunghoang.teammedical.utils.FileDownloader;
import lombok.extern.slf4j.Slf4j;
import org.openqa.selenium.*;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.util.ArrayList;
import java.util.List;

@Slf4j
public class TeamMedicalService {

    private static final int WAIT_TIME_OUT_IN_SECONDS = 30;

    private WebDriver webDriver;

    public TeamMedicalService(WebDriver webDriver) {
        this.webDriver = webDriver;
    }

    private void retryOnTimeout(Runnable r, int retryMax) {
        int retry = 0;
        while (retry < retryMax) {
            try {
                r.run();
                break;
            } catch (TimeoutException e) {
                retry++;
                log.info("Timeout occured, retry count now " + retry + ": " + e.getMessage());
            }
        }
    }

    private WebElement findElementOptional(WebElement webElement, By selector) {
        try {
            return webElement.findElement(selector);
        } catch (NoSuchElementException ignored) {
            return null;
        }
    }

    public void login(String username, String password) {
        retryOnTimeout(() -> {

            log.info("Login");
            webDriver.get("https://www.teammed.com.au/login");

            WebElement usernameElement = webDriver.findElement(By.id("username"));
            WebElement passwordElement = webDriver.findElement(By.id("password"));
            WebElement submitButton = webDriver.findElement(By.cssSelector("input[name='submit']"));

            usernameElement.sendKeys(username);
            passwordElement.sendKeys(password);
            submitButton.click();
            log.info("Logging in...");

            new WebDriverWait(webDriver, WAIT_TIME_OUT_IN_SECONDS).until(ExpectedConditions.presenceOfElementLocated(By.xpath("//div[@id='loginLink']//a[text()='Log out']")));
            log.info("Homepage loaded");

        }, 3);
    }

    public List<InvoiceSummary> listInvoiceSummaries() {
        List<InvoiceSummary> invoiceSummaries = new ArrayList<>();

        retryOnTimeout(() -> {

            WebElement invoicesLink = webDriver.findElement(By.xpath("//nav//a[contains(text(), 'Invoices / Credit Notes')]"));
            String invoicesCreditNotesUrl = invoicesLink.getAttribute("href");

            webDriver.get(invoicesCreditNotesUrl);

            new WebDriverWait(webDriver, WAIT_TIME_OUT_IN_SECONDS).until(ExpectedConditions.presenceOfElementLocated(By.xpath("//h3[text()='Invoices / Credit Notes']")));
            log.info("Invoices page loaded");

            WebElement noMoreTables = webDriver.findElement(By.id("no-more-tables"));
            List<WebElement> rows = noMoreTables.findElements(By.cssSelector("tr"));
            for (WebElement row : rows) {
                List<WebElement> cols = row.findElements(By.cssSelector("td"));
                if (cols.size() > 0) {
                    WebElement pdfLink = cols.size() > 6 ? findElementOptional(cols.get(7), By.cssSelector("a")) : null;
                    invoiceSummaries.add(InvoiceSummary.builder()
                            .id(cols.get(0).getText())
                            .type(cols.get(1).getText())
                            .reference(cols.get(2).getText())
                            .date(cols.get(3).getText())
                            .consignment(cols.get(4).getText())
                            .total(cols.get(5).getText())
                            .totalOutstanding(cols.get(6).getText())
                            .detailsLink(cols.get(0).findElement(By.cssSelector("a")).getAttribute("href"))
                            .pdfLink(pdfLink != null ? pdfLink.getAttribute("href") : null)
                            .build());
                }
            }

        }, 3);

        return invoiceSummaries;
    }

    public Invoice getInvoice(String invoiceId) {
        final Invoice[] invoiceDetails = {null};

        retryOnTimeout(() -> {

            webDriver.get("https://www.teammed.com.au/shop/?page=order_detail&orderid=" + invoiceId);

            new WebDriverWait(webDriver, WAIT_TIME_OUT_IN_SECONDS).until(ExpectedConditions.presenceOfElementLocated(By.xpath("//h3[contains(text(), 'Invoice Detail')]")));

            List<InvoiceLineItem> invoiceLineItems = new ArrayList<>();

            // get invoice line items
            WebElement invoiceDetailsTable = webDriver.findElement(By.id("no-more-tables"));
            List<WebElement> cols = invoiceDetailsTable.findElements(By.xpath(".//tr"));
            for (WebElement col : cols) {
                List<WebElement> rows = col.findElements(By.xpath(".//td"));
                if (rows.size() > 0) {
                    InvoiceLineItem invoiceLineItem = InvoiceLineItem.builder()
                            .code(rows.get(0).getText())
                            .description(rows.get(1).getText())
                            .orderedQuantity(rows.get(2).getText())
                            .suppliedQuantity(rows.get(3).getText())
                            .unitPrice(rows.get(4).getText())
                            .valueExcludingGst(rows.get(5).getText())
                            .valueIncludingGst(rows.get(6).getText())
                            .build();
                    invoiceLineItems.add(invoiceLineItem);
                }
            }

            // get invoice details
            WebElement invoiceDetailsPanelHeading = webDriver.findElement(By.xpath("//div[contains(@class, 'panel-heading') and contains(text(), 'Invoice Details')]/.."));
            List<WebElement> dataListValues = invoiceDetailsPanelHeading.findElements(By.xpath(".//dd"));
            invoiceDetails[0] = Invoice.builder()
                    .id(dataListValues.get(0).getText())
                    .dateSubmitted(dataListValues.get(1).getText())
                    .dateInvoiced(dataListValues.get(2).getText())
                    .contactName(dataListValues.get(3).getText())
                    .reference(dataListValues.get(4).getText())
                    .totalValue(dataListValues.get(5).getText())
                    .consignmentNumber(dataListValues.get(6).getText())
                    .contactName(dataListValues.get(7).getText())
                    .invoiceLineItems(invoiceLineItems)
                    .build();

        }, 3);

        return invoiceDetails[0];
    }

    public String getPdf(InvoiceSummary invoiceSummary) {
        String filePath = null;
        try {
            if (invoiceSummary.getPdfLink() != null) {
                FileDownloader fileDownloader = new FileDownloader(webDriver);
                filePath = fileDownloader.urlDownloader(invoiceSummary.getPdfLink());
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return filePath;
    }

}
