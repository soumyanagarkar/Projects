import javax.imageio.ImageIO;
import javax.swing.*;
import java.awt.*;
import java.io.File;
import java.sql.*;

class Withdraw extends JFrame {
    private Image backgroundImage;

    Withdraw(String username) {
        // Load the background image
        try {
            backgroundImage = ImageIO.read(new File("./bg.jpg")); // Ensure the path is correct
        } catch (Exception e) {
            JOptionPane.showMessageDialog(null, e.getMessage());
        }

        Font f = new Font("Futura", Font.BOLD, 40);
        Font f2 = new Font("Calibri", Font.PLAIN, 22);

        JLabel title = new JLabel("Withdraw Money", JLabel.CENTER);
        JLabel label = new JLabel("Enter Amount:");
        JTextField t1 = new JTextField(10);
        JButton b1 = new JButton("Withdraw");
        JButton b2 = new JButton("Back");

        title.setFont(f);
        label.setFont(f2);
        t1.setFont(f2);
        b1.setFont(f2);
        b2.setFont(f2);

        b2.addActionListener(a -> {
            new Home(username);
            dispose();
        });

        b1.addActionListener(a -> {
            double balance = 0.0;
            double wlimit = 0.0;

            // PART 1: Fetch balance and withdrawal limit
            String url = "jdbc:mysql://localhost:3306/batch2";
            try (Connection con = DriverManager.getConnection(url, "root", "Soumya@29")) {
                String sql = "SELECT balance, wlimit FROM users WHERE username=?";
                try (PreparedStatement pst = con.prepareStatement(sql)) {
                    pst.setString(1, username);
                    ResultSet rs = pst.executeQuery();
                    if (rs.next()) {
                        balance = rs.getDouble("balance");
                        wlimit = rs.getDouble("wlimit");
                    }
                }
            } catch (Exception e) {
                JOptionPane.showMessageDialog(null, e.getMessage());
            }

            // PART 2: Validate input and perform withdrawal
            String s1 = t1.getText();
            double total = 0.0;
            if (s1.isEmpty()) {
                JOptionPane.showMessageDialog(null, "Enter amount");
                return;
            } else {
                double wamount = Double.parseDouble(s1);

                if (wamount > balance) {
                    JOptionPane.showMessageDialog(null, "Insufficient Balance");
                    return;
                } else if (wamount > wlimit) {
                    JOptionPane.showMessageDialog(null, "Limit Exceeded");
                    return;
                } else {
                    total = balance - wamount;
                }

                // PART 3: Update balance in the database
                try (Connection con = DriverManager.getConnection(url, "root", "Soumya@29")) {
                    String sql = "UPDATE users SET balance=? WHERE username=?";
                    try (PreparedStatement pst = con.prepareStatement(sql)) {
                        pst.setDouble(1, total);
                        pst.setString(2, username);
                        pst.executeUpdate();
                        JOptionPane.showMessageDialog(null, "Amount withdrawn successfully");
                        updatePassbook(username, "Withdraw", wamount, balance - wamount);
                    }
                } catch (Exception e) {
                    JOptionPane.showMessageDialog(null, e.getMessage());
                }

                t1.setText("");
                new Home(username);
            }
        });

        // Create a custom JPanel to draw the background image
        ImagePanel mainPanel = new ImagePanel();
        mainPanel.setLayout(null); // Use absolute positioning

        // Set bounds for components
        title.setBounds(200, 30, 400, 50);
        label.setBounds(250, 120, 300, 30);
        t1.setBounds(250, 160, 300, 30);
        b1.setBounds(300, 220, 200, 40);
        b2.setBounds(300, 280, 200, 40);

        // Add components to the main panel
        mainPanel.add(title);
        mainPanel.add(label);
        mainPanel.add(t1);
        mainPanel.add(b1);
        mainPanel.add(b2);

        // Add the main panel to the frame
        Container c = getContentPane();
        c.add(mainPanel);

        setVisible(true);
        setSize(800, 550);
        setLocationRelativeTo(null);
        setDefaultCloseOperation(EXIT_ON_CLOSE);
        setTitle("Withdraw Money");
    }

    // Custom JPanel to draw the background image
    private class ImagePanel extends JPanel {
        @Override
        protected void paintComponent(Graphics g) {
            super.paintComponent(g);
            if (backgroundImage != null) {
                g.drawImage(backgroundImage, 0, 0, getWidth(), getHeight(), this);
            }
        }
    }

    void updatePassbook(String username, String desc, double amount, double balance) {
        String url = "jdbc:mysql://localhost:3306/batch2";
        try(Connection con = DriverManager.getConnection(url,"root","Soumya@29"))
        {
            String sql = "insert into transactions(username,description,amount,balance) values(?,?,?,?)";
            try(PreparedStatement pst= con.prepareStatement(sql))
            {
                pst.setString(1,username);
                pst.setString(2,desc);
                pst.setDouble(3,amount);
                pst.setDouble(4,balance);
                pst.executeUpdate();
            }
        }
        catch(Exception e)
        {
            JOptionPane.showMessageDialog(null,e.getMessage());
        }
    }

    public static void main(String[] args) {
        new Withdraw("Soma");
    }
}




