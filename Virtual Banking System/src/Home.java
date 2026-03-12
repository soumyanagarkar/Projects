import javax.imageio.ImageIO;
import javax.swing.*;
import java.awt.*;
import java.io.File;
import java.sql.*;

class Home extends JFrame {
    private Image backgroundImage;

    Home(String username) {
        // Load the background image
        try {
            backgroundImage = ImageIO.read(new File("./bg.jpg")); // Ensure the path is correct
        } catch (Exception e) {
            JOptionPane.showMessageDialog(null, e.getMessage());
        }

        double balance = 0.0;
        Font f = new Font("Futura", Font.BOLD, 40);
        Font f2 = new Font("Calibri", Font.PLAIN, 22);

        JLabel title = new JLabel("Welcome " + username, JLabel.CENTER);
        JLabel balanceLabel = new JLabel("Balance: ₹0.00", JLabel.CENTER);
        JButton b1 = new JButton("Deposit");
        JButton b2 = new JButton("Withdraw");
        JButton b3 = new JButton("Profile Settings");
        JButton b4 = new JButton("Transfer");
        JButton b5 = new JButton("Passbook");
        JButton b6 = new JButton("LOGOUT");
        JButton b7 = new JButton("Close Account");

        title.setFont(f);
        balanceLabel.setFont(f2);
        b1.setFont(f2);
        b2.setFont(f2);
        b3.setFont(f2);
        b4.setFont(f2);
        b5.setFont(f2);
        b6.setFont(f2);
        b7.setFont(f2);
        b6.setBackground(new Color(255, 51, 51));
        b6.setForeground(Color.WHITE);


        // Create a custom JPanel to draw the background image
        ImagePanel mainPanel = new ImagePanel();
        mainPanel.setLayout(null); // Use absolute positioning

        // Set bounds for components
        title.setBounds(100, 30, 600, 50);
        balanceLabel.setBounds(100, 100, 600, 30);
        b1.setBounds(100, 150, 200, 40);
        b2.setBounds(400, 150, 200, 40);
        b3.setBounds(100, 220, 200, 40);
        b4.setBounds(400, 220, 200, 40);
        b5.setBounds(100, 290, 200, 40);
        b6.setBounds(250,360,200,40);
        b7.setBounds(400, 290, 200, 40);

        // Add components to the main panel
        mainPanel.add(title);
        mainPanel.add(balanceLabel);
        mainPanel.add(b1);
        mainPanel.add(b2);
        mainPanel.add(b3);
        mainPanel.add(b4);
        mainPanel.add(b5);
        mainPanel.add(b6);
        mainPanel.add(b7);

        // Add the main panel to the frame
        Container c = getContentPane();
        c.add(mainPanel);

        b1.addActionListener(a -> {
            new Deposit(username);
            dispose();
        });

        b2.addActionListener(a -> {
            new Withdraw(username);
            dispose();
        });

        b3.addActionListener(a -> {
            new Profile(username);
            dispose();
        });

        b4.addActionListener(a -> {
            new Transfer(username);
            dispose();
        });

        b5.addActionListener(a -> {
            new Passbook(username);
            dispose();
        });

        b6.addActionListener(a -> {
            new Landing();
            dispose();
        });

        b7.addActionListener( a -> {
            String url = "jdbc:mysql://localhost:3306/batch2";

            try (Connection con = DriverManager.getConnection(url, "root", "Soumya@29")) {
                String sql = "delete from users where username=?";
                try (PreparedStatement pst = con.prepareStatement(sql)) {
                    pst.setString(1, username);
                    pst.executeUpdate();
                    JOptionPane.showMessageDialog(null, "Your Account is Successfully Deleted");
                    dispose();
                    new Landing();
                }
            } catch (Exception e) {
                JOptionPane.showMessageDialog(null, e.getMessage());
                return;          }



                }
        );

        String url = "jdbc:mysql://localhost:3306/batch2";
        try (Connection con = DriverManager.getConnection(url, "root", "Soumya@29")) {
            String sql = "select balance from users where username=?";
            try (PreparedStatement pst = con.prepareStatement(sql)) {
                pst.setString(1, username);
                ResultSet rs = pst.executeQuery();
                if (rs.next()) {
                    balance = rs.getDouble("balance");
                }
                balanceLabel.setText("Balance: ₹ " + balance);
            }
        } catch (Exception e) {
            JOptionPane.showMessageDialog(null, e.getMessage());
        }

        setVisible(true);
        setSize(800, 550);
        setLocationRelativeTo(null);
        setDefaultCloseOperation(EXIT_ON_CLOSE);
        setTitle("Home");
    }

    private class ImagePanel extends JPanel {
        @Override
        protected void paintComponent(Graphics g) {
            super.paintComponent(g);
            if (backgroundImage != null) {
                g.drawImage(backgroundImage, 0, 0, getWidth(), getHeight(), this);
            }
        }
    }

    public static void main(String[] args)
    {
        new Home("soma");
    }
}