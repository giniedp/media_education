<?php
	require_once('inc.global.php');

  header('Cache-Control: no-cache, must-revalidate');
  header('Content-type: application/json');
  header('Access-Control-Allow-Origin: *');

  $apicall = $_GET['func']?$_GET['func']:$_POST['func'];
  switch ($apicall) {
    case 'dictionary':
      $sim = trim($_GET['term']?$_GET['term']:$_POST['term']);
      if (strlen($sim) > 2) {
        $vocs = Array();
        foreach (Vocabulary::getSimilarVocabularies($sim) as $voc) {
          $x = $voc->getData();
          $x['label'] = $x['origin']." (".$x['language'].")";
          $vocs[] = $x;
        }

        echo json_encode($vocs);
      }
      break;
    
    default:
      print_r($_GET);
      break;
  
  }
?>
