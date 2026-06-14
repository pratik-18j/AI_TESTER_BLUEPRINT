package com.salesforce.pages;

import com.salesforce.utils.WaitUtils;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;

public class LoginPage {

    private WebDriver driver;

    @FindBy(xpath = "//input[@name='username']")
    private WebElement usernameField;

    @FindBy(xpath = "//input[@name='pw']")
    private WebElement passwordField;

    @FindBy(xpath = "//input[@name='Login']")
    private WebElement loginButton;

    @FindBy(xpath = "//input[@name='rememberUn']")
    private WebElement rememberMeCheckbox;

    @FindBy(xpath = "//div[@id='error']//li")
    private WebElement errorMessage;

    public LoginPage(WebDriver driver) {
        this.driver = driver;
        PageFactory.initElements(driver, this);
    }

    public void enterUsername(String username) {
        try {
            WaitUtils.waitForElementToBeVisible(driver, By.xpath("//input[@name='username']"));
            usernameField.clear();
            usernameField.sendKeys(username);
        } catch (Exception e) {
            throw new RuntimeException("Failed to enter username: " + e.getMessage());
        }
    }

    public void enterPassword(String password) {
        try {
            WaitUtils.waitForElementToBeVisible(driver, By.xpath("//input[@name='pw']"));
            passwordField.clear();
            passwordField.sendKeys(password);
        } catch (Exception e) {
            throw new RuntimeException("Failed to enter password: " + e.getMessage());
        }
    }

    public void clickLoginButton() {
        try {
            WaitUtils.waitForElementToBeClickable(driver, By.xpath("//input[@name='Login']"));
            loginButton.click();
        } catch (Exception e) {
            throw new RuntimeException("Failed to click login button: " + e.getMessage());
        }
    }

    public void clickRememberMe() {
        try {
            WaitUtils.waitForElementToBeClickable(driver, By.xpath("//input[@name='rememberUn']"));
            if (!rememberMeCheckbox.isSelected()) {
                rememberMeCheckbox.click();
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to click remember me: " + e.getMessage());
        }
    }

    public void performLogin(String username, String password) {
        try {
            enterUsername(username);
            enterPassword(password);
            clickLoginButton();
        } catch (Exception e) {
            throw new RuntimeException("Failed to perform login: " + e.getMessage());
        }
    }

    public String getErrorMessage() {
        try {
            WaitUtils.waitForElementToBeVisible(driver, By.xpath("//div[@id='error']//li"));
            return errorMessage.getText();
        } catch (Exception e) {
            return null;
        }
    }

    public boolean isErrorDisplayed() {
        try {
            return errorMessage.isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }

    public String getCurrentUrl() {
        return driver.getCurrentUrl();
    }

    public boolean isUsernameFieldVisible() {
        try {
            return usernameField.isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }
}
