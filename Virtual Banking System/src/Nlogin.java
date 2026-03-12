import javax.imageio.ImageIO;
import javax.swing.*;
import java.awt.*;
import java.io.File;
import java.sql.*;

class Nlogin extends JFrame
{
    private Image backgroundImage;

    Nlogin()
    {
        // Load the background image
        try {
            backgroundImage = ImageIO.read(new File("./bg.jpg")); // Ensure the path is correct
        } catch (Exception e) {
            JOptionPane.showMessageDialog(null, e.getMessage());
        }

        Font f = new Font("Futura", Font.BOLD, 30);
        Font f2 = new Font("Calibri", Font.PLAIN, 18);

        JLabel l1 = new JLabel("Set Username");
        JTextField t1 = new JTextField(10);

        JLabel l2 = new JLabel("Set Password");
        JPasswordField t2 = new JPasswordField(10);

        JLabel l3 = new JLabel("Confirm Password");
        JPasswordField t3 = new JPasswordField(10);

        JLabel l4 = new JLabel("Phone");
        JTextField t4 = new JTextField(15);

        JLabel l5 = new JLabel("Email");
        JTextField t5 = new JTextField(20);

        JLabel l6 = new JLabel("Gender");
        JComboBox<String> genderBox = new JComboBox<>(new String[]{"male", "female", "other"});

        JButton b1 = new JButton("Submit");
        JButton b2 = new JButton("Back");

        JLabel title = new JLabel("Signup", JLabel.CENTER);
        title.setFont(new Font("Arial", Font.BOLD, 28));

        l1.setFont(f2);
        t1.setFont(f2);
        l2.setFont(f2);
        t2.setFont(f2);
        l3.setFont(f2);
        t3.setFont(f2);
        l4.setFont(f2);
        t4.setFont(f2);
        l5.setFont(f2);
        t5.setFont(f2);
        l6.setFont(f2);
        genderBox.setFont(f2);
        b1.setFont(f2);
        b2.setFont(f2);

        // Create a custom JPanel to draw the background image
        ImagePanel mainPanel = new ImagePanel();
        mainPanel.setLayout(null); // Use absolute positioning

        int labelX = 200, fieldX = 400, yStart = 80, width = 150, height = 30, gap = 40;

        title.setBounds(300, 10, 200, 40);

        l1.setBounds(labelX, yStart, width, height);
        t1.setBounds(fieldX, yStart, width, height);

        l2.setBounds(labelX, yStart + gap, width, height);
        t2.setBounds(fieldX, yStart + gap, width, height);

        l3.setBounds(labelX, yStart + 2 * gap, width, height);
        t3.setBounds(fieldX, yStart + 2 * gap, width, height);

        l4.setBounds(labelX, yStart + 3 * gap, width, height);
        t4.setBounds(fieldX, yStart + 3 * gap, width, height);

        l5.setBounds(labelX, yStart + 4 * gap, width, height);
        t5.setBounds(fieldX, yStart + 4 * gap, width, height);

        l6.setBounds(labelX, yStart + 5 * gap, width, height);
        genderBox.setBounds(fieldX, yStart + 5 * gap, width, height);

        b1.setBounds(250, yStart + 6 * gap, 120, 40);
        b2.setBounds(400, yStart + 6 * gap, 120, 40);

        // Add components to the main panel
        mainPanel.add(title);
        mainPanel.add(l1);
        mainPanel.add(t1);
        mainPanel.add(l2);
        mainPanel.add(t2);
        mainPanel.add(l3);
        mainPanel.add(t3);
        mainPanel.add(l4);
        mainPanel.add(t4);
        mainPanel.add(l5);
        mainPanel.add(t5);
        mainPanel.add(l6);
        mainPanel.add(genderBox);
        mainPanel.add(b1);
        mainPanel.add(b2);

        // Add the main panel to the frame
        Container c = getContentPane();
        c.add(mainPanel);

        b1.addActionListener(a -> {
            if (t2.getText().equals(t3.getText())) {
                String url = "jdbc:mysql://localhost:3306/batch2";
                try (Connection con = DriverManager.getConnection(url, "root", "Soumya@29")) {
                    String sql = "INSERT INTO users(username,password,phone,email,gender) VALUES(?, ? , ?, ?, ?)";
                    try (PreparedStatement pst = con.prepareStatement(sql))
                    {
                        pst.setString(1,t1.getText());
                        pst.setString(2,t2.getText());
                        pst.setString(3,t4.getText());
                        pst.setString(4,t5.getText());
                        pst.setString(5,genderBox.getSelectedItem().toString());

                        pst.executeUpdate();
                        JOptionPane.showMessageDialog(null, "Signup Successful");
                        new Home(t1.getText());
                        dispose();
                    }
                } catch (Exception e) {
                    JOptionPane.showMessageDialog(null, e.getMessage());
                }
            } else {
                JOptionPane.showMessageDialog(null, "Passwords do not match");
            }
                }
        );

        setVisible(true);
        setSize(800, 550);
        setLocationRelativeTo(null);
        setDefaultCloseOperation(EXIT_ON_CLOSE);
        setTitle("Signup");
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

    public static void main(String[] args) {
        new Nlogin();
    }
}



