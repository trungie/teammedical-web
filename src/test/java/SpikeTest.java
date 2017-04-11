import com.machinepublishers.jbrowserdriver.JBrowserDriver;
import com.machinepublishers.jbrowserdriver.Settings;
import com.machinepublishers.jbrowserdriver.UserAgent;
import com.trunghoang.teammedical.model.Invoice;
import com.trunghoang.teammedical.service.TeamMedicalService;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.io.IOException;
import java.util.List;

public class SpikeTest {

    public static final String USERNAME = "";
    public static final String PASSWORD = "";

    private static final long WAIT_TIME_OUT_IN_SECONDS = 30;
    private JBrowserDriver driver;

    @Before
    public void setup() throws IOException {
        driver = new JBrowserDriver(Settings.builder()
                .headless(false)
                .userAgent(UserAgent.CHROME)
                .ajaxResourceTimeout(10000)
                .ajaxWait(15000)
                .build());
    }

    @Test
    public void test2() {
        driver.get("https://www.teammed.com.au/login?location=https%3A%2F%2Fwww.teammed.com.au%2F");

        WebElement usernameElement = driver.findElementById("username");
        WebElement passwordElement = driver.findElementById("password");
        WebElement submitButton = driver.findElementByCssSelector("input[name='submit']");

        usernameElement.sendKeys(USERNAME);
        passwordElement.sendKeys(PASSWORD);
        usernameElement.submit();

        new WebDriverWait(driver, WAIT_TIME_OUT_IN_SECONDS).until(ExpectedConditions.presenceOfElementLocated(By.xpath("//div[@id='loginLink']//a[text()='Log out']")));
        System.out.println("homepage loaded");

        WebElement invoicesLink = driver.findElement(By.xpath("//nav//a[contains(text(), 'Invoices / Credit Notes')]"));
        String invoicesCreditNotesUrl = invoicesLink.getAttribute("href");
        System.out.println("invoicesCreditNotesUrl = " + invoicesCreditNotesUrl);

        driver.get(invoicesCreditNotesUrl);

        new WebDriverWait(driver, WAIT_TIME_OUT_IN_SECONDS).until(ExpectedConditions.presenceOfElementLocated(By.xpath("//h3[text()='Invoices / Credit Notes']")));
        System.out.println("Invoices page loaded");

        WebElement noMoreTables = driver.findElement(By.id("no-more-tables"));
        List<WebElement> rows = noMoreTables.findElements(By.cssSelector("tr"));
        for (WebElement row : rows) {
            List<WebElement> cols = row.findElements(By.cssSelector("td"));
            for (WebElement col : cols) {
                String text = col.getText();
                System.out.print(text + " - ");
            }
            System.out.println("");
        }
    }

    @Test
    public void listInvoices() throws Exception {
        TeamMedicalService teamMedicalService = new TeamMedicalService(driver);
        List<Invoice> invoices = teamMedicalService.listInvoices(USERNAME, PASSWORD);

        System.out.println("Invoices...");
        for (Invoice invoice : invoices) {
            System.out.println(invoice);
        }
    }

    @After
    public void closeDriver() {
        driver.quit();
    }

}
