import javax.imageio.ImageIO;
import javax.swing.*;
import java.awt.*;
import java.io.File;
import java.sql.*;

class Elogin extends JFrame {
    private Image backgroundImage;

    Elogin() {
        // Load the background image
        try {
            backgroundImage = ImageIO.read(new File("./bg.jpg")); // Ensure the path is correct
        } catch (Exception e) {
            JOptionPane.showMessageDialog(null, e.getMessage());
        }

        Font f = new Font("Futura", Font.BOLD, 40);
        Font f2 = new Font("Calibri", Font.PLAIN, 22);

        JLabel title = new JLabel("Login", JLabel.CENTER);
        JLabel l1 = new JLabel("Enter Username");
        JTextField t1 = new JTextField(10);
        JLabel l2 = new JLabel("Enter Password");
        JPasswordField t2 = new JPasswordField(10);
        JButton b1 = new JButton("Submit");
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
        title.setBounds(250, 30, 300, 50);
        l1.setBounds(250, 100, 300, 30);
        t1.setBounds(250, 140, 300, 30);
        l2.setBounds(250, 200, 300, 30);
        t2.setBounds(250, 240, 300, 30);
        b1.setBounds(300, 300, 200, 40);
        b2.setBounds(300, 360, 200, 40);

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

        b1.addActionListener(a -> {
            String url = "jdbc:mysql://localhost:3306/batch2";
            try (Connection con = DriverManager.getConnection(url, "root", "Soumya@29")) {
                String sql = "Select * from users where username=? and password=?";
                try (PreparedStatement pst = con.prepareStatement(sql)) {
                    pst.setString(1, t1.getText());
                    String s1 = new String(t2.getPassword());
                    pst.setString(2, s1);

                    ResultSet rs = pst.executeQuery();
                    if (rs.next()) {
                        JOptionPane.showMessageDialog(null, "Successful");
                        new Home(t1.getText());
                        dispose();
                    } else {
                        JOptionPane.showMessageDialog(null, "User  does not exist");
                    }
                }
            } catch (Exception e) {
                JOptionPane.showMessageDialog(null, e.getMessage());
            }
        });

        setVisible(true);
        setSize(800, 550);
        setLocationRelativeTo(null);
        setDefaultCloseOperation(EXIT_ON_CLOSE);
        setTitle("Login");
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

    public static void main(String[] args) {
        //SwingUtilities.invokeLater(Elogin::new);
        new Elogin();
    }
}


