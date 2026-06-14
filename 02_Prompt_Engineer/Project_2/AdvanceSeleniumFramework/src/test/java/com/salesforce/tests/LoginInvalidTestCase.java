package com.salesforce.tests;

import com.salesforce.base.BaseTest;
import com.salesforce.pages.LoginPage;
import com.salesforce.utils.WaitUtils;
import org.testng.Assert;
import org.testng.annotations.Test;

public class LoginInvalidTestCase extends BaseTest {

    @Test(priority = 1, description = "Login with invalid email format and valid password")
    public void testInvalidEmailFormat() {
        try {
            LoginPage loginPage = new LoginPage(driver);
            String invalidEmail = "invalidemail";
            String validPassword = "ValidPassword123";

            loginPage.performLogin(invalidEmail, validPassword);
            WaitUtils.waitForPageLoad(driver);

            Assert.assertTrue(
                    loginPage.isErrorDisplayed(),
                    "Error message not displayed for invalid email format"
            );
        } catch (Exception e) {
            throw new RuntimeException("Test failed: " + e.getMessage());
        }
    }

    @Test(priority = 2, description = "Login with valid email and invalid password")
    public void testInvalidPassword() {
        try {
            LoginPage loginPage = new LoginPage(driver);
            String validEmail = "test@salesforce.com";
            String invalidPassword = "WrongPassword123";

            loginPage.performLogin(validEmail, invalidPassword);
            WaitUtils.waitForPageLoad(driver);

            Assert.assertTrue(
                    loginPage.isErrorDisplayed(),
                    "Error message not displayed for invalid password"
            );
        } catch (Exception e) {
            throw new RuntimeException("Test failed: " + e.getMessage());
        }
    }

    @Test(priority = 3, description = "Login with empty email field and valid password")
    public void testEmptyEmailField() {
        try {
            LoginPage loginPage = new LoginPage(driver);
            String emptyEmail = "";
            String validPassword = "ValidPassword123";

            loginPage.performLogin(emptyEmail, validPassword);
            WaitUtils.waitForPageLoad(driver);

            Assert.assertTrue(
                    loginPage.isErrorDisplayed(),
                    "Error message not displayed for empty email field"
            );
        } catch (Exception e) {
            throw new RuntimeException("Test failed: " + e.getMessage());
        }
    }

    @Test(priority = 4, description = "Login with valid email and empty password field")
    public void testEmptyPasswordField() {
        try {
            LoginPage loginPage = new LoginPage(driver);
            String validEmail = "test@salesforce.com";
            String emptyPassword = "";

            loginPage.performLogin(validEmail, emptyPassword);
            WaitUtils.waitForPageLoad(driver);

            Assert.assertTrue(
                    loginPage.isErrorDisplayed(),
                    "Error message not displayed for empty password field"
            );
        } catch (Exception e) {
            throw new RuntimeException("Test failed: " + e.getMessage());
        }
    }

    @Test(priority = 5, description = "Login with both email and password fields empty")
    public void testBothFieldsEmpty() {
        try {
            LoginPage loginPage = new LoginPage(driver);
            String emptyEmail = "";
            String emptyPassword = "";

            loginPage.performLogin(emptyEmail, emptyPassword);
            WaitUtils.waitForPageLoad(driver);

            Assert.assertTrue(
                    loginPage.isErrorDisplayed(),
                    "Error message not displayed for both fields empty"
            );
        } catch (Exception e) {
            throw new RuntimeException("Test failed: " + e.getMessage());
        }
    }
}
