package com.trunghoang.teammedical.service;

import com.machinepublishers.jbrowserdriver.JBrowserDriver;
import com.trunghoang.teammedical.model.Invoice;
import com.trunghoang.teammedical.model.InvoiceDetails;
import com.trunghoang.teammedical.model.InvoiceItem;
import com.trunghoang.teammedical.utils.FileDownloader;
import lombok.extern.slf4j.Slf4j;
import org.openqa.selenium.By;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.util.ArrayList;
import java.util.List;

@Slf4j
public class TeamMedicalService {

    private static final String LOGIN_PAGE = "https://www.teammed.com.au/login";
    private static final int WAIT_TIME_OUT_IN_SECONDS = 30;

    private JBrowserDriver driver;

    public TeamMedicalService(JBrowserDriver driver) {
        this.driver = driver;
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

    public List<Invoice> listInvoices(String username, String password) {
        List<Invoice> invoices = new ArrayList<>();

        retryOnTimeout(() -> {

            log.info("Login");
            driver.get(LOGIN_PAGE);

            WebElement usernameElement = driver.findElementById("username");
            WebElement passwordElement = driver.findElementById("password");
            WebElement submitButton = driver.findElementByCssSelector("input[name='submit']");

            usernameElement.sendKeys(username);
            passwordElement.sendKeys(password);
            submitButton.click();
            log.info("Logging in...");

            new WebDriverWait(driver, WAIT_TIME_OUT_IN_SECONDS).until(ExpectedConditions.presenceOfElementLocated(By.xpath("//div[@id='loginLink']//a[text()='Log out']")));
            log.info("Homepage loaded");

            WebElement invoicesLink = driver.findElement(By.xpath("//nav//a[contains(text(), 'Invoices / Credit Notes')]"));
            String invoicesCreditNotesUrl = invoicesLink.getAttribute("href");

            driver.get(invoicesCreditNotesUrl);

            new WebDriverWait(driver, WAIT_TIME_OUT_IN_SECONDS).until(ExpectedConditions.presenceOfElementLocated(By.xpath("//h3[text()='Invoices / Credit Notes']")));
            log.info("Invoices page loaded");

            WebElement noMoreTables = driver.findElement(By.id("no-more-tables"));
            List<WebElement> rows = noMoreTables.findElements(By.cssSelector("tr"));
            for (WebElement row : rows) {
                List<WebElement> cols = row.findElements(By.cssSelector("td"));
                if (cols.size() > 0) {
                    WebElement pdfLink = cols.size() > 6 ? findElementOptional(cols.get(7), By.cssSelector("a")) : null;
                    invoices.add(Invoice.builder()
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

        return invoices;
    }

    public InvoiceDetails getDetails(Invoice invoice) {
        final InvoiceDetails[] invoiceDetails = {null};

        retryOnTimeout(() -> {


            driver.get("https://www.teammed.com.au/shop/?page=order_detail&orderid=" + invoice.getId());

            new WebDriverWait(driver, WAIT_TIME_OUT_IN_SECONDS).until(ExpectedConditions.presenceOfElementLocated(By.xpath("//h3[contains(text(), 'Invoice Details')]")));

            List<InvoiceItem> invoiceItems = new ArrayList<>();
            List<WebElement> tables = driver.findElementsByCssSelector("div.standardTable table");

            List<WebElement> invoiceDetailRows = tables.get(1).findElements(By.cssSelector("tbody tr"));
            for (WebElement invoiceDetailRow : invoiceDetailRows) {
                List<WebElement> invoiceDetailCells = invoiceDetailRow.findElements(By.cssSelector("td"));
                invoiceItems.add(InvoiceItem.builder()
                        .code(invoiceDetailCells.get(0).getText())
                        .description(invoiceDetailCells.get(1).getText())
                        .orderedQuantity(invoiceDetailCells.get(2).getText())
                        .suppliedQuantity(invoiceDetailCells.get(3).getText())
                        .unitPrice(invoiceDetailCells.get(4).getText())
                        .valueExcludingGst(invoiceDetailCells.get(5).getText())
                        .valueIncludingGst(invoiceDetailCells.get(6).getText())
                        .build());
            }

            List<WebElement> invoiceHeaderRows = tables.get(0).findElements(By.cssSelector("tbody tr"));

            List<WebElement> firstRowCells = invoiceHeaderRows.get(0).findElements(By.cssSelector("td"));
            List<WebElement> secondRowCells = invoiceHeaderRows.get(1).findElements(By.cssSelector("td"));
            List<WebElement> thirdRowCells = invoiceHeaderRows.get(2).findElements(By.cssSelector("td"));
            List<WebElement> fourthRowCells = invoiceHeaderRows.get(3).findElements(By.cssSelector("td"));

            invoiceDetails[0] = InvoiceDetails.builder()
                    .id(firstRowCells.get(1).getText())
                    .reference(firstRowCells.get(3).getText())
                    .dateSubmitted(secondRowCells.get(1).getText())
                    .totalValue(secondRowCells.get(3).getText())
                    .dateInvoiced(thirdRowCells.get(1).getText())
                    .consignmentNumber(thirdRowCells.get(3).getText())
                    .contactName(fourthRowCells.get(1).getText())
                    .deliveryAddress(fourthRowCells.get(3).getText())
                    .invoiceItems(invoiceItems)
                    .build();

        }, 3);

        return invoiceDetails[0];
    }

    public String getPdf(Invoice invoice) {
        String filePath = null;
        try {
            if (invoice.getPdfLink() != null) {
                FileDownloader fileDownloader = new FileDownloader(driver);
                filePath = fileDownloader.urlDownloader(invoice.getPdfLink());
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return filePath;
    }

}
