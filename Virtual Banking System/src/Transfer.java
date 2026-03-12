import javax.imageio.ImageIO;
import javax.swing.*;
import java.awt.*;
import java.io.File;
import java.sql.*;

class Transfer extends JFrame {
    private Image backgroundImage;

    Transfer(String username) {
        // Load the background image
        try {
            backgroundImage = ImageIO.read(new File("./bg.jpg")); // Ensure the path is correct
        } catch (Exception e) {
            JOptionPane.showMessageDialog(null, e.getMessage());
        }

        Font f = new Font("Futura", Font.BOLD, 30);
        Font f2 = new Font("Calibri", Font.PLAIN, 18);

        JLabel title = new JLabel("Transfer Funds", JLabel.CENTER);
        JLabel l1 = new JLabel("Receiver:");
        JTextField t1 = new JTextField(10);

        JLabel l2 = new JLabel("Amount:");
        JTextField t2 = new JTextField(10);

        JButton b1 = new JButton("Transfer");
        JButton b2 = new JButton("Back");

        title.setFont(f);
        l1.setFont(f2);
        t1.setFont(f2);
        l2.setFont(f2);
        t2.setFont(f2);
        b1.setFont(f2);
        b2.setFont(f2);

        // Create a custom JPanel to draw the background image
        ImagePanel mainPanel = new ImagePanel();
        mainPanel.setLayout(null); // Use absolute positioning

        // Set bounds for components
        title.setBounds(250, 20, 300, 40);
        l1.setBounds(200, 100, 200, 30);
        t1.setBounds(400, 100, 200, 30);
        l2.setBounds(200, 160, 200, 30);
        t2.setBounds(400, 160, 200, 30);
        b1.setBounds(250, 220, 120, 40);
        b2.setBounds(400, 220, 120, 40);

        // Add components to the main panel
        mainPanel.add(title);
        mainPanel.add(l1);
        mainPanel.add(t1);
        mainPanel.add(l2);
        mainPanel.add(t2);
        mainPanel.add(b1);
        mainPanel.add(b2);

        // Add the main panel to the frame
        Container c = getContentPane();
        c.add(mainPanel);

        b2.addActionListener(a -> {
            new Home(username);
            dispose();
        });

        b1.addActionListener(a -> {
            String receiver = t1.getText();
            String amountStr = t2.getText();

            if (receiver.isEmpty() || amountStr.isEmpty()) {
                JOptionPane.showMessageDialog(null, "Please enter all fields");
                return;
            }

            double amount = Double.parseDouble(amountStr);
            double balance = fetchBalance(username);

            if (amount > balance) {
                JOptionPane.showMessageDialog(null, "Insufficient balance");
                return;
            }

            String url = "jdbc:mysql://localhost:3306/batch2";
            try (Connection con = DriverManager.getConnection(url, "root", "Soumya@29")) {
                // Update sender's balance
                String sql = "UPDATE users SET balance = ? WHERE username = ?";
                try (PreparedStatement pst = con.prepareStatement(sql)) {
                    pst.setDouble(1, balance - amount);
                    pst.setString(2, username);
                    pst.executeUpdate();
                    updatePassbook(username, "Transfer to " + receiver, -amount, balance - amount);
                }

                // Update receiver's balance
                double receiverBalance = fetchBalance(receiver);
                sql = "UPDATE users SET balance = ? WHERE username = ?";
                try (PreparedStatement pst = con.prepareStatement(sql)) {
                    pst.setDouble(1, receiverBalance + amount);
                    pst.setString(2, receiver);
                    pst.executeUpdate();
                    updatePassbook(receiver, "Transfer from " + username, amount, receiverBalance + amount);
                }

                JOptionPane.showMessageDialog(null, "Successfully transferred money");
                t1.setText("");
                t2.setText("");
            } catch (Exception e) {
                JOptionPane.showMessageDialog(null, e.getMessage());
            }
        });

        setVisible(true);
        setSize(800, 550);
        setLocationRelativeTo(null);
        setDefaultCloseOperation(EXIT_ON_CLOSE);
        setTitle("Transfer Funds");
    }

    // Custom JPanel to draw the background image
    class ImagePanel extends JPanel {
        @Override
        protected void paintComponent(Graphics g) {
            super.paintComponent(g);
            if (backgroundImage != null) {
                g.drawImage(backgroundImage, 0, 0, getWidth(), getHeight(), this);
            }
        }
    }

    double fetchBalance(String username) {
        double balance = 0.0;
        String url = "jdbc:mysql://localhost:3306/batch2";
        try(Connection con = DriverManager.getConnection(url,"root","Soumya@29"))
        {
            String sql = "select balance from users where username =?";

            try(PreparedStatement pst = con.prepareStatement(sql))
            {
                pst.setString(1,username);

                ResultSet rs = pst.executeQuery();

                if (rs.next())
                {
                    balance = rs.getDouble("balance");
                }

            }
        }
        catch(Exception e)
        {
            JOptionPane.showMessageDialog(null,e.getMessage());
        }

        return balance;
    }

    void updatePassbook(String username,String desc,double amount,double balance)
    {
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
        new Transfer("swati");
    }
}

