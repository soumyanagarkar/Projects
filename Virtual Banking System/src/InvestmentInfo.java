import javax.swing.*;
import java.awt.*;

class InvestmentInfo extends JFrame {
    InvestmentInfo() {
        setTitle("Bank Information and Investment Schemes");
        setSize(800, 550);
        setLocationRelativeTo(null);
        setDefaultCloseOperation(DISPOSE_ON_CLOSE);
        setLayout(new BorderLayout(10, 10)); // Use BorderLayout for main layout

        // Title Label
        JLabel titleLabel = new JLabel("Bank Information and Investment Schemes", JLabel.CENTER);
        titleLabel.setFont(new Font("Arial", Font.BOLD, 24)); // Set title font size
        titleLabel.setBorder(BorderFactory.createEmptyBorder(10, 0, 10, 0)); // Add padding to title
        add(titleLabel, BorderLayout.NORTH);

        // Create a panel for the main content
        JPanel mainPanel = new JPanel();
        mainPanel.setLayout(new GridBagLayout()); // Use GridBagLayout for better control
        GridBagConstraints gbc = new GridBagConstraints();
        gbc.fill = GridBagConstraints.HORIZONTAL; // Allow components to fill horizontally
        gbc.insets = new Insets(15, 15, 15, 15); // Add padding around components

        // Bank Contact Information
        JPanel bankInfoPanel = createPanel("Bank Information", new Color(173, 216, 230), 18);
        bankInfoPanel.add(Box.createVerticalStrut(10)); // Add vertical space
        bankInfoPanel.add(new JLabel("Phone Number: 123-456-7890"));
        bankInfoPanel.add(Box.createVerticalStrut(10)); // Add vertical space
        bankInfoPanel.add(new JLabel("Toll Free Number: 1800222299"));
        bankInfoPanel.add(Box.createVerticalStrut(10)); // Add vertical space
        bankInfoPanel.add(new JLabel("Address: Bank of India, 21 Moorfields, New Delhi, 45608"));
        bankInfoPanel.add(Box.createVerticalStrut(10)); // Add vertical space
        bankInfoPanel.add(new JLabel("Email: boi@gmail.com"));
        bankInfoPanel.add(Box.createVerticalStrut(10)); // Add vertical space
        bankInfoPanel.add(new JLabel("Working Hours: Mon-Fri, 9 AM - 5 PM"));
        gbc.gridx = 0;
        gbc.gridy = 0;
        gbc.weightx = 1.0; // Allow the panel to grow horizontally
        gbc.weighty = 0.2; // Allow the panel to grow vertically
        mainPanel.add(bankInfoPanel, gbc);

        // Types of Accounts and Interest Rates
        JPanel accountInfoPanel = createPanel("Types of Accounts and Interest Rates", new Color(144, 238, 144), 18);
        accountInfoPanel.add(new JLabel("Savings Account: 4% per annum"));
        accountInfoPanel.add(Box.createVerticalStrut(10)); // Add vertical space
        accountInfoPanel.add(new JLabel("Current Account: 0.5% per annum"));
        gbc.gridy++;
        mainPanel.add(accountInfoPanel, gbc);

        // Loan Information
        JPanel loanInfoPanel = createPanel("Loan Information", new Color(255, 228, 196), 18);
        loanInfoPanel.add(new JLabel("Personal Loan: 10% per annum"));
        loanInfoPanel.add(Box.createVerticalStrut(10)); // Add vertical space
        loanInfoPanel.add(new JLabel("Home Loan: 8% per annum"));
        loanInfoPanel.add(Box.createVerticalStrut(10)); // Add vertical space
        loanInfoPanel.add(new JLabel("Car Loan: 9% per annum"));
        gbc.gridy++;
        mainPanel.add(loanInfoPanel, gbc);

        // Fixed Deposit Information
        JPanel fdInfoPanel = createPanel("Fixed Deposit (FD) Interest Rates", new Color(255, 255, 224), 18);
        fdInfoPanel.add(new JLabel("Duration: 1 Year - Interest Rate: 5.5%"));
        fdInfoPanel.add(Box.createVerticalStrut(10)); // Add vertical space
        fdInfoPanel.add(new JLabel("Duration: 2 Years - Interest Rate: 6.0%"));
        fdInfoPanel.add(Box.createVerticalStrut(10)); // Add vertical space
        fdInfoPanel.add(new JLabel("Duration: 3 Years - Interest Rate: 6.5%"));
        fdInfoPanel.add(Box.createVerticalStrut(10)); // Add vertical space
        fdInfoPanel.add(new JLabel("Duration: 5 Years - Interest Rate: 7.0%"));
        gbc.gridy++;
        mainPanel.add(fdInfoPanel, gbc);

        // Investment Schemes
        JPanel investmentInfoPanel = createPanel("Investment Schemes", new Color(173, 216, 230), 18);
        investmentInfoPanel.add(new JLabel("Fixed Deposits: 5.5% - 7.0% - Safe investment with guaranteed returns."));
        investmentInfoPanel.add(Box.createVerticalStrut(10)); // Add vertical space
        investmentInfoPanel.add(new JLabel("Mutual Funds: 8% - 12% - Diversified portfolio managed by professionals."));
        investmentInfoPanel.add(Box.createVerticalStrut(10)); // Add vertical space
        investmentInfoPanel.add(new JLabel("Stocks: Varies - High risk, high reward investment."));
        investmentInfoPanel.add(Box.createVerticalStrut(10)); // Add vertical space
        investmentInfoPanel.add(new JLabel("Bonds: 4% - 6% - Fixed income investment with lower risk."));
        investmentInfoPanel.add(Box.createVerticalStrut(10)); // Add vertical space
        investmentInfoPanel.add(new JLabel("Recurring Deposits: 5.75% - Regular fixed amount investment."));
        investmentInfoPanel.add(Box.createVerticalStrut(10)); // Add vertical space
        investmentInfoPanel.add(new JLabel("Public Provident Fund (PPF): 7.1% - Long-term savings scheme with tax benefits."));
        gbc.gridy++;
        mainPanel.add(investmentInfoPanel, gbc);

        // Wrap the main panel in a JScrollPane
        JScrollPane scrollPane = new JScrollPane(mainPanel);
        scrollPane.setVerticalScrollBarPolicy(JScrollPane.VERTICAL_SCROLLBAR_ALWAYS); // Always show vertical scroll bar
        add(scrollPane, BorderLayout.CENTER); // Add the scroll pane to the center of the frame

        // Close Button
        JButton backButton = new JButton("Back");
        backButton.setPreferredSize(new Dimension(150, 35)); // Set a larger size for the button
        backButton.setForeground(Color.WHITE);
        backButton.setBackground(new Color(255, 51, 51));
        backButton.setFocusPainted(false);
        backButton.setBorder(BorderFactory.createEmptyBorder(5, 25, 5, 25));
        backButton.addActionListener(
                a ->
                {
                    new Landing();
                    dispose();
                }
        );
        JPanel buttonPanel = new JPanel(); // Create a panel for the button
        buttonPanel.add(backButton); // Add the button to the panel
        buttonPanel.setAlignmentX(Component.CENTER_ALIGNMENT); // Center the button
        add(buttonPanel, BorderLayout.SOUTH); // Add the button panel to the bottom

        setVisible(true);
    }

    private JPanel createPanel(String title, Color color, int titleFontSize) {
        JPanel panel = new JPanel();
        panel.setBackground(color);
        panel.setLayout(new BoxLayout(panel, BoxLayout.Y_AXIS)); // Vertical layout for content
        panel.setAlignmentX(Component.CENTER_ALIGNMENT); // Center the panel

        // Add title label
        JLabel titleLabel = new JLabel(title);
        titleLabel.setFont(new Font("Arial", Font.BOLD, titleFontSize));
        titleLabel.setAlignmentX(Component.LEFT_ALIGNMENT); // Center the title
        titleLabel.setBorder(BorderFactory.createEmptyBorder(10, 0, 10, 0)); // Add padding to title
        panel.add(titleLabel);

        // Add padding to the panel
        panel.setBorder(BorderFactory.createEmptyBorder(15, 15, 15, 15)); // Add padding around the panel
        return panel;
    }

    public static void main(String[] args) {
        new InvestmentInfo();
    }
}
