import com.trunghoang.teammedical.model.TeamMedicalInvoice;
import com.trunghoang.teammedical.model.TeamMedicalInvoiceLineItem;
import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.htmlunit.HtmlUnitDriver;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;

public class StaticTest {

    public static final String filePath = "file:///" + new File("src/test/resources/pages/invoice.html").getAbsolutePath();
    private WebDriver driver;

    @Before
    public void setup() throws IOException {
        java.util.logging.Logger.getLogger("com.gargoylesoftware").setLevel(Level.OFF);

        driver = new HtmlUnitDriver();
    }

    @Test
    public void getInvoice() {
        driver.get(filePath);

        WebElement invoiceDetailsPanelHeading = driver.findElement(By.xpath("//div[contains(@class, 'panel-heading') and contains(text(), 'Invoice Details')]/.."));
        String html = invoiceDetailsPanelHeading.getAttribute("outerHTML");

        List<WebElement> dataListTypes = invoiceDetailsPanelHeading.findElements(By.xpath(".//dt"));
        List<WebElement> dataListValues = invoiceDetailsPanelHeading.findElements(By.xpath(".//dd"));

        for (int i = 0; i < dataListTypes.size(); i++) {
            WebElement type = dataListTypes.get(i);
            WebElement value = dataListValues.get(i);

//            System.out.println(type.getAttribute("innerHTML") + " " + value.getAttribute("innerHTML"));
        }

        TeamMedicalInvoice teamMedicalInvoice = TeamMedicalInvoice.builder()
                .id(dataListValues.get(0).getText())
                .dateSubmitted(dataListValues.get(1).getText())
                .dateInvoiced(dataListValues.get(2).getText())
                .contactName(dataListValues.get(3).getText())
                .reference(dataListValues.get(4).getText())
                .totalValue(dataListValues.get(5).getText())
                .consignmentNumber(dataListValues.get(6).getText())
                .contactName(dataListValues.get(7).getText())
                .build();

        System.out.println("invoice = " + teamMedicalInvoice);
    }

    @Test
    public void getInvoiceDetails() {
        List<TeamMedicalInvoiceLineItem> invoiceLineItems = new ArrayList<>();

        driver.get(filePath);

        WebElement invoiceDetailsTable = driver.findElement(By.id("no-more-tables"));
        List<WebElement> cols = invoiceDetailsTable.findElements(By.xpath(".//tr"));
        for (WebElement col : cols) {
            List<WebElement> rows = col.findElements(By.xpath(".//td"));
            if (rows.size() > 0) {
                for (WebElement row : rows) {
                    String title = row.getAttribute("data-title");
                    String value = row.getAttribute("innerHTML");
    //                System.out.println(title + " - " + value);
                }

                TeamMedicalInvoiceLineItem invoiceLineItem = TeamMedicalInvoiceLineItem.builder()
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

        System.out.println("invoiceLineItems = " + invoiceLineItems);
    }

}
