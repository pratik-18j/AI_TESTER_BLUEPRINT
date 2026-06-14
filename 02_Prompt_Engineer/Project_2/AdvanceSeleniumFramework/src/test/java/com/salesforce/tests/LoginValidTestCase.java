package com.salesforce.tests;

import com.salesforce.base.BaseTest;
import com.salesforce.pages.LoginPage;
import com.salesforce.utils.WaitUtils;
import org.testng.Assert;
import org.testng.annotations.Test;

public class LoginValidTestCase extends BaseTest {

    @Test(priority = 1, description = "Login with valid credentials")
    public void testValidLogin() {
        try {
            LoginPage loginPage = new LoginPage(driver);
            String validUsername = "test@salesforce.com";
            String validPassword = "ValidPassword123";

            loginPage.performLogin(validUsername, validPassword);
            WaitUtils.waitForPageLoad(driver);

            String currentUrl = loginPage.getCurrentUrl();
            Assert.assertTrue(
                    currentUrl.contains("lightning") || currentUrl.contains("home"),
                    "Login failed: URL does not contain expected values"
            );
        } catch (Exception e) {
            throw new RuntimeException("Test failed: " + e.getMessage());
        }
    }

    @Test(priority = 2, description = "Verify remember me functionality")
    public void testRememberMeFunctionality() {
        try {
            LoginPage loginPage = new LoginPage(driver);
            String validUsername = "test@salesforce.com";
            String validPassword = "ValidPassword123";

            loginPage.clickRememberMe();
            loginPage.performLogin(validUsername, validPassword);
            WaitUtils.waitForPageLoad(driver);

            String currentUrl = loginPage.getCurrentUrl();
            Assert.assertTrue(
                    currentUrl.contains("lightning") || currentUrl.contains("home"),
                    "Login with remember me failed"
            );
        } catch (Exception e) {
            throw new RuntimeException("Test failed: " + e.getMessage());
        }
    }

    @Test(priority = 3, description = "Verify login page loads successfully")
    public void testLoginPageLoad() {
        try {
            LoginPage loginPage = new LoginPage(driver);
            Assert.assertTrue(
                    loginPage.isUsernameFieldVisible(),
                    "Login page did not load correctly"
            );
        } catch (Exception e) {
            throw new RuntimeException("Test failed: " + e.getMessage());
        }
    }
}
